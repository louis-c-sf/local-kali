import {
  AccessDeniedError,
  isAccessDeniedError,
} from '@/errors/AccessDeniedError';
import { Component } from 'react';
import AccessDeniedErrorElement from '.';
import withRouter, { RouteComponentProps } from '@/utils/withRouter';

export interface AccessDeniedErrorBoundaryProps {
  children?: React.ReactNode;
}

type State = {
  error: AccessDeniedError | null;
};

class _AccessDeniedErrorBoundary extends Component<
  AccessDeniedErrorBoundaryProps & RouteComponentProps,
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    if (isAccessDeniedError(error)) {
      return { error };
    }
    return null;
  }

  componentDidUpdate(
    prevProps: AccessDeniedErrorBoundaryProps & RouteComponentProps,
  ) {
    if (this.props.location !== prevProps.location) {
      this.setState({ error: null });
    }
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      return <AccessDeniedErrorElement error={error} />;
    }

    return children;
  }
}

export const AccessDeniedErrorBoundary = withRouter(_AccessDeniedErrorBoundary);

export const WithAccessDeniedErrorBoundary = (
  WrappedComponent: React.ComponentType,
) => {
  const WithAccessDeniedErrorBoundaryComponent = (
    props: JSX.IntrinsicAttributes,
  ) => (
    <AccessDeniedErrorBoundary>
      <WrappedComponent {...props} />
    </AccessDeniedErrorBoundary>
  );

  WithAccessDeniedErrorBoundaryComponent.displayName = `WithAccessDeniedErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAccessDeniedErrorBoundaryComponent;
};
