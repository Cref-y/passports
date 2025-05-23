import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import {  sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'


// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = 'cb15623527378bac5dce1ac3f79bbac1'

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [sepolia ]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  metadata,
  features: {
    analytics: true,
    connectMethodsOrder: ["social", "email", "wallet"] ,
    legalCheckbox: true// Optional - defaults to your Cloud configuration
  }
})

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}