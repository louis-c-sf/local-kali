import React from "react";
import ErrorContent from "./ErrorContent";
import { UserType } from "types/LoginType";
import { flushRecords } from "utility/debug/actionsLoggerMiddleware";

export class GlobalBoundary extends React.Component<
  { user?: UserType },
  {
    error: any | null;
    user: UserType | null;
    errorInfo: React.ErrorInfo | undefined;
  }
> {
  constructor(props: { user?: UserType }) {
    super(props);
    this.state = {
      error: null,
      user: props.user ?? null,
      errorInfo: undefined,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  static getDerivedStateFromError(error: Error) {
    return {
      error: error,
    };
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <ErrorContent error={this.state.error} errorInfo={this.state.errorInfo} />
    );
  }
}
