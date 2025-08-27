import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ items = [] }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }];

    const pathMap = {
      'customer-directory': 'Customers',
      'customer-profile': 'Customer Profile',
      'email-templates': 'Templates',
      'workflow-builder': 'Workflows',
    };

    pathSegments?.forEach((segment, index) => {
      if (pathMap?.[segment]) {
        const path = '/' + pathSegments?.slice(0, index + 1)?.join('/');
        breadcrumbs?.push({
          label: pathMap?.[segment],
          path: path,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items?.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbItems?.map((item, index) => (
        <React.Fragment key={item?.path || index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-muted-foreground/50" />
          )}
          {index === breadcrumbItems?.length - 1 ? (
            <span className="text-foreground font-medium">{item?.label}</span>
          ) : (
            <Link
              to={item?.path}
              className="hover:text-foreground transition-smooth"
            >
              {item?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;