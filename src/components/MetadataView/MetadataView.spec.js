import React from 'react';
import { cleanup, render, waitFor, configure, fireEvent } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import mockProps from '../../test/mockProps';
import { MetadataView } from './MetadataView';

configure({ testIdAttribute: 'data-test-id' });

const props = {
  sdk: {
    ...mockProps.sdk,
  }
};

describe('MetadataView sidebar component', () => {
  beforeEach(() => {
    props.sdk.space = {
      getAsset: jest.fn()
    };
    props.sdk.entry = {
      fields: {
        image: {
          getValue: jest.fn(),
          onValueChanged: jest.fn()
        },
        title: {
          setValue: jest.fn()
        },
        description: {
          setValue: jest.fn()
        }
      }
    };
    props.sdk.notifier = {
      error: jest.fn()
    }
  });
  afterEach(cleanup);

  it('should disable everything if theres no image', async () => {
    const appView = render(<MetadataView {...props} />);
    const { getByTestId } = appView;
    await waitFor(() => {
      expect(getByTestId('cf-ui-button').disabled).toBeTruthy();
      expect(getByTestId('cf-ui-controlled-input').disabled).toBeTruthy();
      expect(appView.container).toMatchSnapshot();
    });
  });

  it('should enable everything if theres an image', async () => {
    const imgData = {
      url: "//images.ctfassets.net/k3tebg1cbyuz/4dgP2U7BeMuk0icguS4qGw/59b8fe25285cdd1b5fcc69bd5555b3be/doge.png",
      contentType: 'image/png',
      details: { size: 200, height: 100, width: 100 }
    };
    props.sdk.space.getAsset.mockImplementation(() => ({
      fields: { file: { 'en-US': imgData } }
    }))
    props.sdk.entry.fields.image.getValue.mockImplementation(() => ({
      sys: {
        id: '098dsjnwe9ds'
      }
    }));

    const appView = render(<MetadataView {...props} />);
    const { getByTestId } = appView;
    await waitFor(() => {
      expect(getByTestId('cf-ui-button').disabled).toBeFalsy();
      expect(getByTestId('cf-ui-controlled-input').disabled).toBeFalsy();
      expect(appView.container).toMatchSnapshot();
    });
  });

  describe('Calling metadata API', () => {
    beforeEach(() => {
      const imgData = {
        url: '//images.ctfassets.net/k3tebg1cbyuz/4dgP2U7BeMuk0icguS4qGw/59b8fe25285cdd1b5fcc69bd5555b3be/doge.jpeg',
        contentType: 'image/png',
        details: { size: 200, height: 100, width: 100 }
      };
      const expectedPath = '/k3tebg1cbyuz/4dgP2U7BeMuk0icguS4qGw/59b8fe25285cdd1b5fcc69bd5555b3be/doge.jpeg'

      props.sdk.entry.fields.image.getValue.mockImplementation(() => ({
        sys: {
          id: '098dsjnwe9ds'
        }
      }));
      props.sdk.space.getAsset.mockImplementation(() => ({
        fields: {file: { 'en-US': imgData }}
      }))

      fetchMock.get(`http://localhost:4000/exif${expectedPath}`, {
        tags: {
          title: 'some_title',
          description: 'some_description'
        }
      });
    });

    afterEach(() => fetchMock.restore());

    it('should fetch tags and render them on btn click', async () => {
      const appView = render(<MetadataView {...props} />);
      const { getByTestId, getAllByTestId } = appView;

      fireEvent.click(getByTestId('cf-ui-button'));
      
      await waitFor(() => {
        expect(props.sdk.entry.fields.title.setValue).toHaveBeenCalled();
        expect(props.sdk.entry.fields.title.setValue.mock.calls[0][0]).toBe('some_title')
        expect(props.sdk.entry.fields.description.setValue).toHaveBeenCalled();
        expect(props.sdk.entry.fields.description.setValue.mock.calls[0][0]).toBe('some_description')
        expect(appView.container).toMatchSnapshot();
      });
    });
  });
});
