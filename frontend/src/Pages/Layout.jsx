import React from 'react';
import Breadcrumbs from '../components/Breadcumbs/breadcumbs';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white shadow-md">
     
      <div className="p-1">
      <Breadcrumbs className="ml-3" />
        {children}
      </div>   
    </div>
  );
};

export default Layout;
