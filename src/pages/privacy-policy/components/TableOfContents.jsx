import React from 'react';

const TableOfContents = ({ sections, activeSection, onSectionClick }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSectionClick(sectionId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
      <nav className="space-y-1">
        {sections?.map((section) => (
          <button
            key={section?.id}
            onClick={() => scrollToSection(section?.id)}
            className={`
              block w-full text-left px-3 py-2 rounded-md text-sm transition-colors
              ${section?.level === 2 ? 'pl-6 text-gray-600' : 'text-gray-700'}
              ${activeSection === section?.id 
                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' : 'hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {section?.title}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;