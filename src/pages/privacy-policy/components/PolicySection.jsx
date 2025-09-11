import React from 'react';

const PolicySection = ({ id, title, content }) => {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      <div className="text-gray-700">
        {content}
      </div>
    </section>
  );
};

export default PolicySection;