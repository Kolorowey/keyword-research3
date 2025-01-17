import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// No need to import FontAwesomeIcon and faChevronRight when using CDN

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex space-x-2 ml-16 mt-4">
        <li className="breadcrumb-item">
          <Link to="/" className="text-gray-600 hover:  hover:scale-105 transition-transform text-sm">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to} className="breadcrumb-item flex items-center">
              <span className="mx-2">
                <i className="fas fa-chevron-right text-gray-400"></i>
              </span>
              <Link to={to} className="text-gray-600 hover: hover:scale-105 transition-transform text-sm">{value}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;