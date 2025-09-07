import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { NdaTemplateLibrary } from './components/NdaTemplateLibrary';
import { NdaEditor } from './components/NdaEditor';
import { SignatureTracker } from './components/SignatureTracker';
import betaOnboardingService from '../../services/betaOnboardingService';
import customerService from '../../services/customerService';

export default function NdaManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ndaDocuments, setNdaDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredNdas, setFilteredNdas] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor states
  const [selectedNda, setSelectedNda] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [ndaContent, setNdaContent] = useState('');
  const [ndaTitle, setNdaTitle] = useState('');
  
  // Template states
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    filterNdaDocuments();
  }, [ndaDocuments, statusFilter, searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [customersData, ndaData] = await Promise.all([
        customerService?.getCustomers(),
        betaOnboardingService?.getNdaDocuments()
      ]);

      setCustomers(customersData || []);
      setNdaDocuments(ndaData || []);
      
      // Load default templates
      loadTemplates();

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = () => {
    // Default NDA templates
    const defaultTemplates = [
      {
        id: 'basic-nda',
        name: 'Basic NDA Template',
        type: 'Standard',
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into between {{company_name}} ("Company") and {{customer_name}} ("Recipient") for the purpose of beta testing {{program_name}}.

1. CONFIDENTIAL INFORMATION
All information shared during the beta testing period, including but not limited to:
- Software features and functionality
- Performance data and metrics
- Technical documentation
- Business strategies and plans

2. OBLIGATIONS
The Recipient agrees to:
- Maintain strict confidentiality of all information
- Not disclose information to third parties
- Use information solely for beta testing purposes
- Return or destroy confidential materials upon request

3. TERM
This agreement remains in effect for the duration of the beta program and 2 years thereafter.

4. GOVERNING LAW
This agreement shall be governed by the laws of {{jurisdiction}}.

By signing below, both parties agree to the terms of this NDA.

Date: {{current_date}}
Company Representative: _________________
Beta Tester: _________________`
      },
      {
        id: 'comprehensive-nda',
        name: 'Comprehensive NDA Template',
        type: 'Enterprise',
        content: `COMPREHENSIVE NON-DISCLOSURE AGREEMENT

PARTIES: This Agreement is between {{company_name}} ("Disclosing Party") and {{customer_name}} ("Receiving Party").

WHEREAS, the Disclosing Party wishes to engage the Receiving Party in beta testing activities for {{program_name}};

NOW THEREFORE, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes all technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information.

2. NON-DISCLOSURE OBLIGATIONS
The Receiving Party agrees to:
a) Hold all Confidential Information in strict confidence
b) Not disclose such information to any third parties
c) Not use such information except as necessary for beta testing
d) Apply the same degree of care to protect Confidential Information as applied to own confidential information

3. EXCEPTIONS
This Agreement does not apply to information that:
a) Is publicly known through no breach of this Agreement
b) Is rightfully received from third parties
c) Is independently developed without use of Confidential Information
d) Is required to be disclosed by law

4. RETURN OF MATERIALS
Upon termination, all materials containing Confidential Information must be returned or destroyed.

5. TERM AND TERMINATION
This Agreement continues until terminated by either party with 30 days written notice.

6. REMEDIES
Breach of this Agreement may cause irreparable harm, entitling the Disclosing Party to injunctive relief.

Signature: _________________
Date: {{current_date}}`
      },
      {
        id: 'simple-nda',
        name: 'Simple NDA Template',
        type: 'Basic',
        content: `BETA TESTING NON-DISCLOSURE AGREEMENT

{{customer_name}} agrees to keep confidential all information about {{program_name}} shared by {{company_name}} during beta testing.

This includes:
• Software features and bugs
• Performance data
• Documentation
• Feedback and discussions

Duration: Until public release + 1 year

Signature: _________________
Date: {{current_date}}`
      }
    ];
    
    setTemplates(defaultTemplates);
    setSelectedTemplate(defaultTemplates?.[0]);
    setNdaTitle(defaultTemplates?.[0]?.name);
    setNdaContent(defaultTemplates?.[0]?.content);
  };

  const filterNdaDocuments = () => {
    let filtered = ndaDocuments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered?.filter(nda => nda?.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm?.toLowerCase();
      filtered = filtered?.filter(nda => 
        nda?.customer?.first_name?.toLowerCase()?.includes(search) ||
        nda?.customer?.last_name?.toLowerCase()?.includes(search) ||
        nda?.customer?.email?.toLowerCase()?.includes(search) ||
        nda?.nda_title?.toLowerCase()?.includes(search)
      );
    }

    setFilteredNdas(filtered || []);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNdaTitle(template?.name);
    setNdaContent(template?.content);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!ndaTitle?.trim() || !ndaContent?.trim()) {
      alert('Please provide both title and content for the NDA.');
      return;
    }

    try {
      setSaving(true);
      
      // Create a new custom template
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name: ndaTitle,
        type: 'Custom',
        content: ndaContent,
        created_at: new Date()?.toISOString()
      };

      setTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      
      alert('Template saved successfully!');
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendForSignature = async (customerId) => {
    if (!customerId || !ndaTitle?.trim() || !ndaContent?.trim()) {
      alert('Please select a customer and ensure NDA content is complete.');
      return;
    }

    try {
      setSaving(true);

      const ndaData = {
        customer_id: customerId,
        nda_title: ndaTitle,
        nda_content: ndaContent,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString() // 30 days from now
      };

      await betaOnboardingService?.createNdaDocument(ndaData);
      
      // Refresh the list
      const updatedNdas = await betaOnboardingService?.getNdaDocuments();
      setNdaDocuments(updatedNdas || []);
      
      alert('NDA sent for signature successfully!');
      setSelectedNda(null);

    } catch (error) {
      console.error('Error sending NDA for signature:', error);
      alert('Failed to send NDA. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureUpdate = async (ndaId, signatureUrl) => {
    try {
      await betaOnboardingService?.signNdaDocument(ndaId, signatureUrl);
      
      // Refresh the list
      const updatedNdas = await betaOnboardingService?.getNdaDocuments();
      setNdaDocuments(updatedNdas || []);
      
    } catch (error) {
      console.error('Error updating signature:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Signature' },
    { value: 'signed', label: 'Signed' },
    { value: 'expired', label: 'Expired' },
    { value: 'declined', label: 'Declined' }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NDA Management</h1>
              <p className="mt-2 text-gray-600">Manage non-disclosure agreements and track signatures</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                New Template
              </Button>
              <Button
                onClick={() => {
                  if (customers?.length > 0) {
                    handleSendForSignature(customers?.[0]?.id);
                  }
                }}
                disabled={!ndaContent?.trim()}
              >
                Send for Signature
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by customer name, email, or NDA title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Template Library (3 columns) */}
          <div className="lg:col-span-3">
            <NdaTemplateLibrary
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>

          {/* Center Panel - NDA Editor (6 columns) */}
          <div className="lg:col-span-6">
            <NdaEditor
              title={ndaTitle}
              content={ndaContent}
              isEditing={isEditing}
              saving={saving}
              onTitleChange={setNdaTitle}
              onContentChange={setNdaContent}
              onSave={handleSaveTemplate}
              onEdit={() => setIsEditing(true)}
              onCancel={() => {
                setIsEditing(false);
                if (selectedTemplate) {
                  setNdaTitle(selectedTemplate?.name);
                  setNdaContent(selectedTemplate?.content);
                }
              }}
              customers={customers}
              onSendForSignature={handleSendForSignature}
            />
          </div>

          {/* Right Panel - Signature Tracker (3 columns) */}
          <div className="lg:col-span-3">
            <SignatureTracker
              ndaDocuments={filteredNdas}
              onSignatureUpdate={handleSignatureUpdate}
              onRefresh={loadInitialData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}