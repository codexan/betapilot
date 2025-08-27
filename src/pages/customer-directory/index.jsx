import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import CustomerTable from './components/CustomerTable';
import CustomerCard from './components/CustomerCard';
import AddCustomerModal from './components/AddCustomerModal';
import BulkEmailModal from './components/BulkEmailModal';
import Pagination from './components/Pagination';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService';

const CustomerDirectory = () => {
  const { user, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    organization: '',
    participationStatus: [],
    regions: [],
    segments: []
  });
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load customers from Supabase
  useEffect(() => {
    if (!authLoading && user) {
      loadCustomers();
    }
  }, [authLoading, user]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await getCustomers();
      
      if (error) {
        setError(error);
      } else {
        setCustomers(data || []);
      }
    } catch (err) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
      } else {
        setError('Failed to load customers. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort customers
  const processedCustomers = useMemo(() => {
    let filtered = [...customers];

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(customer =>
        customer?.first_name?.toLowerCase()?.includes(searchTerm) ||
        customer?.last_name?.toLowerCase()?.includes(searchTerm) ||
        customer?.email?.toLowerCase()?.includes(searchTerm) ||
        customer?.organization?.toLowerCase()?.includes(searchTerm) ||
        customer?.job_title?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Apply organization filter
    if (filters?.organization) {
      filtered = filtered?.filter(customer => 
        customer?.organization?.toLowerCase()?.includes(filters?.organization?.toLowerCase())
      );
    }

    // Apply participation status filter
    if (filters?.participationStatus?.length > 0) {
      filtered = filtered?.filter(customer =>
        filters?.participationStatus?.includes(customer?.participation_status)
      );
    }

    // Apply regions filter
    if (filters?.regions?.length > 0) {
      filtered = filtered?.filter(customer =>
        filters?.regions?.some(region => 
          customer?.region?.toLowerCase()?.includes(region?.toLowerCase())
        )
      );
    }

    // Apply segments filter
    if (filters?.segments?.length > 0) {
      filtered = filtered?.filter(customer =>
        customer?.segments?.some(segment =>
          filters?.segments?.some(filterSegment =>
            segment?.toLowerCase()?.includes(filterSegment?.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      if (sortConfig?.key === 'name') {
        aValue = `${a?.first_name} ${a?.last_name}`;
        bValue = `${b?.first_name} ${b?.last_name}`;
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [customers, filters, sortConfig]);

  // Pagination
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCustomers?.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedCustomers?.length / itemsPerPage);

  // Get applied filters count
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters?.search) count++;
    if (filters?.organization) count++;
    if (filters?.participationStatus?.length > 0) count += filters?.participationStatus?.length;
    if (filters?.regions?.length > 0) count += filters?.regions?.length;
    if (filters?.segments?.length > 0) count += filters?.segments?.length;
    return count;
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectionChange = (customerIds) => {
    setSelectedCustomers(customerIds);
  };

  const handleCustomerSelectionChange = (customerId, checked) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev?.filter(id => id !== customerId));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAddCustomer = async (newCustomerData) => {
    try {
      const { data, error } = await createCustomer(newCustomerData);
      
      if (error) {
        setError(error);
      } else {
        await loadCustomers(); // Reload to get fresh data
      }
    } catch (err) {
      setError('Failed to create customer');
    }
  };

  const handleEditCustomer = async (customer) => {
    try {
      const { data, error } = await updateCustomer(customer?.id, customer);
      
      if (error) {
        setError(error);
      } else {
        await loadCustomers(); // Reload to get fresh data
      }
    } catch (err) {
      setError('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const { error } = await deleteCustomer(customerId);
      
      if (error) {
        setError(error);
      } else {
        await loadCustomers(); // Reload to get fresh data
      }
    } catch (err) {
      setError('Failed to delete customer');
    }
  };

  const handleBulkEmail = (customerIds) => {
    setSelectedCustomers(customerIds);
    setIsBulkEmailModalOpen(true);
  };

  const handleExport = () => {
    const exportIds = selectedCustomers?.length > 0 ? selectedCustomers : processedCustomers?.map(c => c?.id);
    console.log('Export customers:', exportIds);
    // Implement export functionality
  };

  // Auth guard
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="pt-16 min-h-screen bg-background">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Icon name="Loader2" size={24} />
                </div>
                <span className="text-muted-foreground">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="pt-16 min-h-screen bg-background">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
                <p className="text-muted-foreground mb-4">Please sign in to access the customer directory.</p>
                <Button onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="pt-16 min-h-screen bg-background">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Icon name="Loader2" size={24} />
                </div>
                <span className="text-muted-foreground">Loading customers...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="text-red-600 hover:text-red-800 text-xs underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFilterSidebarOpen}
                onToggle={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                appliedFiltersCount={appliedFiltersCount}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Customer Directory</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your beta testing community and track participation
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="hidden md:flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <Icon name="Table" size={16} />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                  
                  <Button
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => setIsAddCustomerModalOpen(true)}
                  >
                    Add Customer
                  </Button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  {processedCustomers?.length} customer{processedCustomers?.length !== 1 ? 's' : ''} found
                  {appliedFiltersCount > 0 && ` (${appliedFiltersCount} filter${appliedFiltersCount !== 1 ? 's' : ''} applied)`}
                </div>
                
                {selectedCustomers?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedCustomers?.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Mail"
                      iconPosition="left"
                      onClick={() => handleBulkEmail(selectedCustomers)}
                    >
                      Send Email
                    </Button>
                  </div>
                )}
              </div>

              {/* Customer List */}
              {processedCustomers?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
                  <p className="text-muted-foreground mb-4">
                    {appliedFiltersCount > 0 
                      ? 'Try adjusting your filters or search criteria.' :'Get started by adding your first customer to the beta program.'
                    }
                  </p>
                  {appliedFiltersCount === 0 && (
                    <Button onClick={() => setIsAddCustomerModalOpen(true)}>
                      Add First Customer
                    </Button>
                  )}
                </div>
              ) : viewMode === 'table' ? (
                <CustomerTable
                  customers={paginatedCustomers}
                  selectedCustomers={selectedCustomers}
                  onSelectionChange={handleSelectionChange}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onBulkEmail={handleBulkEmail}
                  onEditCustomer={handleEditCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedCustomers?.map((customer) => (
                    <CustomerCard
                      key={customer?.id}
                      customer={customer}
                      isSelected={selectedCustomers?.includes(customer?.id)}
                      onSelectionChange={handleCustomerSelectionChange}
                      onEditCustomer={handleEditCustomer}
                      onDeleteCustomer={handleDeleteCustomer}
                      onBulkEmail={handleBulkEmail}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={processedCustomers?.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSave={handleAddCustomer}
      />
      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        selectedCustomers={selectedCustomers}
        customers={customers}
      />
    </>
  );
};

export default CustomerDirectory;