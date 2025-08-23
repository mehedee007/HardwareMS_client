import React from 'react'
import Footer from '../_components/footer'
import { Navbar } from '../_components/navbar'
import PrivateProvider from './privateProvider'

function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <PrivateProvider>
                <Navbar />
                {children}
                <Footer />
            </PrivateProvider>
        </div>
    )
}

export default PrivateLayout