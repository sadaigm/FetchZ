import React from 'react';
import { Typography } from 'antd';
import type { RequestHistory } from '../types/request.types';

const { Text } = Typography;

interface RelativeTimestampProps {
  history: RequestHistory;
}

const RelativeTimestamp: React.FC<RelativeTimestampProps> = ({ history }) => {
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    // Seconds (less than 1 minute)
    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? `1 sec ago` : `${diffInSeconds} secs ago`;
    }
    
    // Minutes (less than 1 hour)
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? `1 min ago` : `${diffInMinutes} mins ago`;
    }
    
    // Hours (less than 1 day)
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours < 24) {
      return diffInHours === 1 ? `1 hr ago` : `${diffInHours} hrs ago`;
    }
    
    // Days (less than 1 week)
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) {
      return diffInDays === 1 ? `1 day ago` : `${diffInDays} days ago`;
    }
    
    // Weeks (less than 1 month)
    const diffInWeeks = Math.floor(diffInSeconds / 604800);
    if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? `1 w ago` : `${diffInWeeks} w ago`;
    }
    
    // Months (less than 1 year)
    const diffInMonths = Math.floor(diffInSeconds / 2628000); // Approximate month (30.44 days)
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? `1 mon ago` : `${diffInMonths} mon ago`;
    }
    
    // Years
    const diffInYears = Math.floor(diffInSeconds / 31536000); // 365 days
    return diffInYears === 1 ? `1 y ago` : `${diffInYears} y ago`;
  };

  return (
    <Text type="secondary" style={{ fontSize: '12px' }}>
      {getRelativeTime(history.timestamp)}
    </Text>
  );
};

export default RelativeTimestamp;