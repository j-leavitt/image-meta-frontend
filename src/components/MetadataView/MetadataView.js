import React from 'react';
import { Paragraph, Button, Note, CheckboxField } from '@contentful/forma-36-react-components';
import get from 'lodash/get';

async function callAPI(url) {
  console.log(`process.env.REACT_APP_API_URL`)
  const res = await fetch(`${process.env.REACT_APP_API_URL}/exif${url}`);
  const data = await res.json();
  return data.tags;
}

export class MetadataView extends React.Component {
  constructor(props) {
    super(props);

    const { fields } = props.sdk.entry;

    this.state = {
      value: "",
      overwrite: true,
      isMissingImage: !fields.image.getValue(),
      unsupportedImageType: false,
      imageRequirementsNotMet: false,
      isFetchingTags: false
    }

    // this.validateImage();
  }

  componentDidMount() {
    const { image } = this.props.sdk.entry.fields;

    image.onValueChanged(() => {
      this.setState(() => ({
        isMissingImage: !image.getValue()
      }));
      // always validate the image
      this.validateImage();
    });
  }

  validateImage = async () => {
    const { sdk } = this.props;
    const { image } = sdk.entry.fields;
    const imageId = get(image.getValue(), 'sys.id');
    if (!imageId) { return; }

    // const file = await sdk.space.getAsset(imageId);
    // const locale = sdk.locales.default;
    // const contentType = get(file, `fields.file.${locale}.contentType`);
    // const details = get(file, `fields.file.${locale}.details`);

    // test if file extension is PNG/JPEG/JPG
    // const isImageTypeValid = new RegExp(/^image\/(png|jpe?g)$/, 'i').test(contentType);
    const isImageTypeValid = true;
    // const isImageIncompatible = details.size > MAX_FILE_SIZE ||
    //                             details.width < MIN_DIMENSION_SIZE ||
    //                             details.height < MIN_DIMENSION_SIZE;
    const isImageIncompatible = false;

    this.setState(() => ({
      unsupportedImageType: !isImageTypeValid,
      imageRequirementsNotMet: isImageIncompatible
    }))
  }

  toggleOverwrite = () => {
    this.setState(state => ({
      overwrite: !state.overwrite
    }));
  }

  updateTags = async (tags) => {
    for (const [fieldName, field] of Object.entries(this.props.sdk.entry.fields)) {
      if (tags[fieldName]) {
        await field.setValue(tags[fieldName]);
      }
    }
  }

  fetchTags = async () => {
    const { sdk } = this.props;

    const imageId = get(sdk.entry.fields.image.getValue(), 'sys.id')
    const file = await sdk.space.getAsset(imageId);
    const locale = sdk.locales.default;
    const fullURL = get(file, `fields.file.${locale}.url`);
    const imagePath = new URL(`https://${fullURL}`).pathname;
    this.setState({ isFetchingTags: true });

    try {
      const exifTags = await callAPI(imagePath);

      // upload new tags
      // const newTags = this.state.overwrite ? aiTags : [...aiTags, ...this.state.tags];
      const newTags = { ...exifTags }
      this.updateTags(newTags);
    } catch (e) {
      this.props.sdk.notifier.error("Failed to obtain image metadata. Please try again later.")
    } finally {
      this.setState(() => ({ isFetchingTags: false }));
    }
  }

  updateValue = (e) => {
    this.setState({
      value: e.target.value
    });
  }

  render() {
    let hasImageError = !this.state.isMissingImage && (this.state.unsupportedImageType || this.state.imageRequirementsNotMet)
    let imageErrorMsg = this.state.unsupportedImageType ? "Unfortunately, we can only auto-tag PNG and JPG file types" : "Please make sure your image is less than 5MB and has dimensions of at least 80px for both width and height";

    return <div>
      <Paragraph>Hello Sidebar Component</Paragraph>
      {
        hasImageError &&
        <Note noteType="warning">{imageErrorMsg}</Note>
      }
      <Button
        id="fetch-tag-btn"
        buttonType="primary"
        type="button"
        disabled={this.state.isMissingImage || hasImageError}
        loading={this.state.isFetchingTags}
        onClick={this.fetchTags}
      >
        Autofill Metadata
      </Button>
      <CheckboxField
        id="overwrite-tags"
        labelText="Overwrite existing metadata"
        disabled={this.state.isMissingImage || hasImageError}
        checked={this.state.overwrite}
        onChange={this.toggleOverwrite}
      />
    </div>
  }
}

