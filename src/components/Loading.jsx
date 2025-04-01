const Loading = ({ title }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-32 space-y-8">
      <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      <p className="text-center">{title}</p>
    </div>
  );
};

export default Loading;
