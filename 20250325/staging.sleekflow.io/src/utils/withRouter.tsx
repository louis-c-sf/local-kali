import { ComponentType } from 'react';
import {
  useNavigate,
  useLocation,
  useParams,
  NavigateFunction,
  Location,
  Params,
} from 'react-router-dom';

// Define the types for the injected props
export interface RouteComponentProps {
  navigate: NavigateFunction;
  location: Location;
  params: Params;
}

function withRouter<T extends RouteComponentProps>(
  Component: ComponentType<T>,
) {
  const Wrapped = (props: Omit<T, keyof RouteComponentProps>) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    return (
      <Component
        {...(props as T)}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  };
  Wrapped.displayName = `withRouter(${Component.displayName || Component.name})`;

  return Wrapped;
}

export default withRouter;
