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

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
    this.handleChange = this.handleChange.bind(this);
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

  handleChange(color, event) {
    this.setState({ value: color.hex });
  }

  getValue(): string {
    return this.state.value;
  }
}
