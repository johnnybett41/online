import './Skeleton.css';

const Skeleton = ({ className = '' }) => {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
};

export const SkeletonLine = ({ className = '' }) => {
  return <div className={`skeleton-line ${className}`.trim()} aria-hidden="true" />;
};

export default Skeleton;
