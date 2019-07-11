import * as React from "react";
import { Editor, EditorState, ContentState, RichUtils, convertFromHTML, compositeDecorator } from "draft-js";
import { convertToHTML } from "draft-convert";
import { Button } from "library-simplified-reusable-components";

interface EditorFieldState {
  editorState: EditorState;
}

interface EditorFieldProps {
  summary: string;
  disabled: boolean;
}

export default class EditorField extends React.Component<EditorFieldProps, EditorFieldState> {
  constructor(props) {
    super(props);
    let blocksFromHTML;
    try {
      blocksFromHTML = convertFromHTML(JSON.parse(props.summary));
    }
    catch {
      blocksFromHTML = convertFromHTML(props.summary);
    }
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );
    this.state = {editorState: EditorState.createWithContent(state, compositeDecorator)};

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
    let content = React.createElement(style[0].toLowerCase(), null, style[0]);
    let isActive = this.state.editorState.getSelection().getHasFocus() && this.state.editorState.getCurrentInlineStyle().has(style);
    return (
      <Button
        key={style}
        callback={(e) => {this.changeStyle(e, style);}}
        content={content}
        className={`inline squared${isActive ? " active" : ""}`}
        disabled={this.props.disabled}
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
    return (
      <div className="editor-field">
        { ["BOLD", "ITALIC", "UNDERLINE"].map(style => this.renderButton(style)) }
        <Editor editorState={this.state.editorState} onChange={this.onChange} handleKeyCommand={this.handleKeyCommand} readOnly={this.props.disabled} />
      </div>
    );
  }
}
