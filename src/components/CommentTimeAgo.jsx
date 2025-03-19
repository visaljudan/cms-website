import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const CommentTimeAgo = ({ createdAt }) => {
  const parseDate = (date) => {
    return typeof date === "string" ? new Date(date) : date;
  };

  const getTimeAgo = () =>
    formatDistanceToNow(parseDate(createdAt), { addSuffix: true });

  const [timeAgo, setTimeAgo] = useState(getTimeAgo());

  useEffect(() => {
    setTimeAgo(getTimeAgo());

    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo());
    }, 10000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return <>{timeAgo}</>;
};

export default CommentTimeAgo;
