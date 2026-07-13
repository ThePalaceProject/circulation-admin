import * as React from "react";
import { CompactPicker } from "react-color";
import { SettingData } from "../interfaces";

export interface ColorPickerProps {
  value?: string;
  setting: SettingData;
}

export interface ColorPickerState {
  value?: string;
}

export default class ColorPicker extends React.Component<
  ColorPickerProps,
  ColorPickerState
> {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
    this.handleChange = this.handleChange.bind(this);
  }

  // The form can mount before its setting data has loaded, in which case this
  // picker initializes from the setting's default. Adopt the real value when the
  // parent supplies it, or the field would keep submitting that stale default.
  // Only adopt it when the incoming value actually changes, so that an unrelated
  // re-render does not discard a color the admin has just picked.
  componentDidUpdate(prevProps: ColorPickerProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  render(): JSX.Element {
    return (
      <div className="color-picker">
        <CompactPicker
          color={this.state.value}
          triangle="hide"
          width="500px"
          onChangeComplete={this.handleChange}
        />
        <input
          type="hidden"
          name={this.props.setting.key}
          value={this.state.value}
        />
      </div>
    );
  }

  handleChange(color) {
    this.setState({ value: color.hex });
  }

  getValue(): string {
    return this.state.value;
  }
}
