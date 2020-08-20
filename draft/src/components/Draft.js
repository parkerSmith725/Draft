import React from 'react';
import {Editor,EditorState,RichUtils,convertToRaw,DefaultDraftBlockRenderMap,EditorBlock} from 'draft-js';
import {Map} from 'immutable';

import styles from './_Draft.module.scss';

class Custom extends React.Component{
    render(){
        const {block, contentState} = this.props;
        //const {foo} = this.props.blockProps;
        // console.log('block',block);
        // console.log('content state',contentState);
        // const data = contentState.getEntity(block.).getData();
        // console.log('data',data);
        return (
            <span>
                {this.props.children}
            </span>
        );
    }
}

const blockRenderMap = Map({
    'GL-CUSTOM': {
        // element is used during paste or html conversion to auto match your component;
        // it is also retained as part of this.props.children and not stripped out
        element: 'div',
        wrapper:<Custom />
    }
});

function myBlockRenderer(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'GL-CUSTOM') {
        return {
            component: Custom,
            editable: true,
            props: {},
        };
    }
}
  
  // keep support for other draft default block types and add our myCustomBlock type
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

class DraftContainer extends React.Component{
    constructor(props){
        super(props);

        this.state = {editorState: EditorState.createEmpty()};
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.handleBeforeInput = this.handleBeforeInput.bind(this);
        this.onChange = (editorState) => {
            console.log(convertToRaw(editorState.getCurrentContent()));
            this.setState({editorState});
        };
        this._onAlign = this._onAlign.bind(this);

        this.styleMap = {
            'RIGHT':{
                textAlign:'right',
                display:'block'
            },
            'CENTER':{
                textAlign:'center',
                display:'block'
            },
            'LEFT':{
                textAlign:'left',
                display:'block'
            },
            'GL-CUSTOM':{
                border:'solid 1px yellow',
                color:'red'
            }
        };
    }

    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
    
        if (newState) {
          this.onChange(newState);
          return 'handled';
        }
    
        return 'not-handled';
    }
    handleBeforeInput(char,editorState){
        console.log(char);
        if(char === '@'){
            let newState = RichUtils.toggleBlockType(editorState,'GL-CUSTOM');
            let nextState = RichUtils.toggleInlineStyle(newState,'GL-CUSTOM');
            this.onChange(nextState);

            return 'handled';
        }

        return 'not-handled';
    }
    _onBoldClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }
    _onItalicClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }
    _onAlign(align) {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, align));
    }
    _makeCustom(){
        this.onChange(RichUtils.toggleBlockType(this.state.editorState,'GL-CUSTOM'));
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState,'GL-CUSTOM'));
    }

    render(){
        return (
            <div className={styles.container}>
                <button onClick={this._onBoldClick.bind(this)}>Bold</button>
                <button onClick={this._onItalicClick.bind(this)}>Italic</button>
                <button onClick={() => {this._onAlign('LEFT')}}>Left</button>
                <button onClick={() => {this._onAlign('CENTER')}}>Center</button>
                <button onClick={() => {this._onAlign('RIGHT')}}>Right</button>
                <button onClick={this._makeCustom.bind(this)}>Custom</button>
                <Editor 
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand} 
                    handleBeforeInput={this.handleBeforeInput}
                    onChange={this.onChange} 
                    customStyleMap={this.styleMap}
                    blockRenderMap={extendedBlockRenderMap}
                />
            </div>
        );
    }
}

export default DraftContainer;