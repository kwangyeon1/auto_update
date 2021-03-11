/* eslint react/jsx-props-no-spreading: off */
import React from 'react';

const LazyExtensionPage = React.lazy(() =>
  import('../containers/extension/ExtensionPage')
);

export const ExtensionPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyExtensionPage {...props} />
  </React.Suspense>
);