import * as React from "react";

function PlusIcon() {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 15 15`}>
      <path
        d="M7.5.28a.95.95 0 00-.95.95v5.32H1.23a.95.95 0 100 1.9h5.32v5.32a.95.95 0 001.9 0V8.45h5.32a.95.95 0 100-1.9H8.45V1.23A.95.95 0 007.5.28z"
        fill="var(--color, var(--WHITE))"
      />
    </svg>
  );
}

export default PlusIcon;
