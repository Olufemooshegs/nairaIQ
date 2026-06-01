import React from 'react'

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="page-transition">{children}</div>
}

export default PageTransition
