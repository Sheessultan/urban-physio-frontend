import { Navigate, useLocation } from 'react-router-dom';
import PolicyPageLayout from '../../components/PolicyPageLayout';
import { getPolicyByPath } from '../../constants/policyPages';

export default function PolicyPage() {
  const { pathname } = useLocation();
  const policy = getPolicyByPath(pathname);

  if (!policy) {
    return <Navigate to="/" replace />;
  }

  return <PolicyPageLayout policy={policy} />;
}
