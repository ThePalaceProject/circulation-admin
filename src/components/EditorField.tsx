import * as React from "react";
import { Editor, EditorState, ContentState, RichUtils, convertFromHTML, compositeDecorator } from "draft-js";
import { convertToHTML } from "draft-convert";
import { Button } from "library-simplified-reusable-components";

interface EditorFieldState {
  editorState: EditorState;
}

interface EditorFieldProps {
  content: string;
  disabled: boolean;
}

export default class EditorField extends React.Component<EditorFieldProps, EditorFieldState> {
  constructor(props) {
    super(props);
    let blocksFromHTML;
    try {
      blocksFromHTML = convertFromHTML(JSON.parse(props.content));
    } catch {
      blocksFromHTML = convertFromHTML(props.content);
    }
    const contentState = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );
    this.state = { editorState: EditorState.createWithContent(contentState, compositeDecorator) };

    this.onChange = this.onChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.getValue = this.getValue.bind(this);
    this.changeStyle = this.changeStyle.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  handleKeyCommand(command, editorState) {
   const newState = RichUtils.handleKeyCommand(editorState, command);
   if (newState) {
     this.onChange(newState);
     return "handled";
   }
   return "not-handled";
  }

  renderButton(style: string): JSX.Element {
    let buttonContent = React.createElement(style[0].toLowerCase(), null, style);
    let isActive = this.state.editorState.getSelection().getHasFocus() && this.state.editorState.getCurrentInlineStyle().has(style.toUpperCase());
    return (
      <Button
        content={buttonContent}
        mouseDown={true}
        key={style}
        callback={(e) => { this.changeStyle(e, style.toUpperCase()); }}
        className={`btn inline squared${isActive ? " active" : ""}`}
        disabled={this.props.disabled}
        type="button"
      />
    );
  }

  changeStyle(e, style: string) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
  }

  getValue() {
    return convertToHTML(this.state.editorState.getCurrentContent());
  }

  render() {
    const styles = ["Bold", "Italic", "Underline"];
    return (
      <div className="editor-field">
        <ul>{ styles.map(style => this.renderButton(style)) }</ul>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          handleKeyCommand={this.handleKeyCommand}
          readOnly={this.props.disabled}
        />
      </div>
    );
  }
}
