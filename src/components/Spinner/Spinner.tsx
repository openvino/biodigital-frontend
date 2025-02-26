const FullScreenSpinner = () => {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  };
  
  export default FullScreenSpinner;