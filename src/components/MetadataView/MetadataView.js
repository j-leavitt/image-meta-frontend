import React from 'react';
import { Button, Note, CheckboxField } from '@contentful/forma-36-react-components';
import get from 'lodash/get';

import { styles } from './styles';

async function callAPI(url) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/exif${url}`);
  const data = await res.json();
  return data.tags;
}

export class MetadataView extends React.Component {
  constructor(props) {
    super(props);

    const { fields } = props.sdk.entry;

    this.state = {
      overwrite: true,
      isMissingImage: !fields.image.getValue(),
      isFetchingTags: false
    }
  }

  componentDidMount() {
    // obtain image info from Contentful sdk
    const { image } = this.props.sdk.entry.fields;

    // keep track of whether or not an image is currently associated with the entry
    image.onValueChanged(() => {
      this.setState(() => ({
        isMissingImage: !image.getValue()
      }));
    });
  }

  toggleOverwrite = () => {
    this.setState(state => ({
      overwrite: !state.overwrite
    }));
  }

  // uses values returned from API to update all entry fields, if the field name is present
  // in the data
  updateTags = async (tags) => {  
    for (const [fieldName, field] of Object.entries(this.props.sdk.entry.fields)) {
      if (tags[fieldName]) {
        await field.setValue(tags[fieldName]);
      }
    }
  }

  // retreives image metadata from API by providing API with image path
  fetchTags = async () => {
    const { sdk } = this.props;

    // get image path using image data extracted from sdk
    const imageId = get(sdk.entry.fields.image.getValue(), 'sys.id')
    const file = await sdk.space.getAsset(imageId);
    const locale = sdk.locales.default;
    const fullURL = get(file, `fields.file.${locale}.url`);
    const imagePath = new URL(`https://${fullURL}`).pathname;
    this.setState({ isFetchingTags: true });

    try {
      const exifTags = await callAPI(imagePath);
      const newTags = { ...exifTags }
      this.updateTags(newTags);
    } catch (e) {
      this.props.sdk.notifier.error("Failed to obtain image metadata. Please try again later.")
    } finally {
      this.setState(() => ({ isFetchingTags: false }));
    }
  }

  render() {
    return <div className={styles.inputWrapper}>
      <Button
        id="fetch-tag-btn"
        className={styles.btn}
        buttonType="primary"
        type="button"
        disabled={this.state.isMissingImage}
        loading={this.state.isFetchingTags}
        onClick={this.fetchTags}
      >
        Autofill Metadata
      </Button>
      <CheckboxField
        id="overwrite-tags"
        labelText="Overwrite existing metadata"
        disabled={this.state.isMissingImage}
        checked={this.state.overwrite}
        onChange={this.toggleOverwrite}
      />
    </div>
  }
}

