// src/components/PinataUploader.tsx
import { useState } from 'react'
import axios from 'axios'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'

interface PinataUploaderProps {
  onUploadComplete?: (cid: string, url: string) => void
}

export default function FileUploader({ onUploadComplete }: PinataUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState('')
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    try {
      setUploading(true)
      setError('')
      setProgress(0)
      
      // Step 1: Get upload URL from our backend
      const uploadUrlResponse = await axios.post('/api/pinata/upload-url', {
        name: file.name,
        maxSizeInMB: 50 // 50MB max file size
      })
      
      const { uploadUrl, cid } = uploadUrlResponse.data
      
      // Step 2: Upload the file directly to Pinata
      await axios.put(
        uploadUrl,
        file,
        {
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setProgress(progress)
            }
          }
        }
      )
      
      // Step 3: Get the gateway URL
      const gatewayResponse = await axios.get(`/api/pinata/gateway-url/${cid}`)
      const { gatewayUrl } = gatewayResponse.data
      
      setFileUrl(gatewayUrl)
      
      if (onUploadComplete) {
        onUploadComplete(cid, gatewayUrl)
      }
      
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload to IPFS</CardTitle>
        <CardDescription>Upload your file to Pinata IPFS</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <input
              type="file"
              className="cursor-pointer"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          
          {file && (
            <div className="text-sm">
              <p>Selected file: {file.name}</p>
              <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
              <p>Type: {file.type}</p>
            </div>
          )}
          
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <div className="text-xs text-center">{progress}%</div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {fileUrl && (
            <Alert>
              <AlertDescription>
                File uploaded successfully! View it <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">here</a>.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={uploadFile} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload to IPFS'}
        </Button>
      </CardFooter>
    </Card>
  )
}