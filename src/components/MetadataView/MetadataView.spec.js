import React from 'react';
import { render } from '@testing-library/react';

import { MetadataView } from './MetadataView';

describe('Sidebar component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<MetadataView />);

    expect(getByText('Hello Sidebar Component')).toBeInTheDocument();
  });
});
