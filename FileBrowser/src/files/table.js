import React from 'react'
import Moment from 'moment'
import ClassNames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import fileIconsJs from 'file-icons-js'

import BaseFile from './../base-file.js'
import { BaseFileConnectors } from './../base-file.js'

function float_precision(float_value, precision) {
  float_value = parseFloat(float_value);
  if (isNaN(float_value)) {
    return parseFloat('0').toFixed(precision);
  }
  else {
    var power = Math.pow(10, precision);
    float_value = (Math.round(float_value * power) / power).toFixed(precision);
    return float_value.toString();
  }
}

function file_size(size) {
  if (size > 1024) {
    var kb_size = size / 1024;
    if (kb_size > 1024) {
      var mb_size = kb_size / 1024;
      return '' + float_precision(mb_size, 2) + ' MB';
    }
    return '' + Math.round(kb_size) + ' kB';
  }
  return '' + size + ' B';
}

class TableFile extends BaseFile {
  render() {


    var icon = (<span className={'FileBrowser__icon ' + fileIconsJs.getClass(this.props.name)}></span>)


    var inAction = (this.props.isDragging || this.props.action);

    var name;
    if (!inAction && this.props.isDeleting) {
      name = (
        <form className="deleting" onSubmit={this.handleDeleteSubmit}>
          <a
            href={this.props.url || "#"}
            download="download"
            onClick={(event) => {
              event.preventDefault();
              this.handleFileClick();
            }}
          >
            {icon}
            {this.getName()}
          </a>
          <div className="actions">
            <button type="submit" className="btn btn-sm btn-secondary">
              Confirm Deletion
            </button>
          </div>
        </form>
      );
    }
    else if (!inAction && this.props.isRenaming) {
      name = (
        <form className="renaming" onSubmit={this.handleRenameSubmit}>
          {icon}
          <input
            ref="newName"
            className="form-control input-sm"
            type="text"
            value={this.state.newName}
            onChange={this.handleNewNameChange}
            onBlur={this.handleCancelEdit}
          />
        </form>
      );
    }
    else {
      name = (
        <a
          href={this.props.url || "#"}
          download="download"
          onClick={(event) => {
            event.preventDefault();
            this.handleFileClick();
          }}
        >
          {icon}
          {this.getName()}
        </a>
      );
    }

    var draggable = (
      <div>
        {name}
      </div>
    );
    if (typeof this.props.browserProps.moveFile === 'function') {
      draggable = this.props.connectDragPreview(draggable);
    }
    const modifier = (this.props.modified === 0) ? ' modified grey' : ' modified'
    var row;
    if(this.props.hasFiles){
      row = (
        <tr
          className={ClassNames('file', {
            pending: (this.props.action),
            dragging: (this.props.isDragging),
            dragover: (this.props.isOver),
            selected: (this.props.isSelected),
          }) + modifier}
          onClick={this.handleItemClick}
          onDoubleClick={this.handleItemDoubleClick}
        >
          <td className="name">
            <div style={{paddingLeft: (this.props.depth * 16) + 'px'}}>
              {draggable}
            </div>
          </td>
          <td width="30"><div
            onClick={(evt)=>this.handleFileFavoriting(evt, this.props)} className={this.props.isFavorite ? 'Favorite__star--file' : 'Favorite__star--empty'}></div></td>
          <td className="size">{file_size(this.props.size)}</td>
          <td className="modified">
            {typeof this.props.modified === 'undefined' ? '-' : Moment((this.props.modified * 1000), 'x').fromNow()}
          </td>
        </tr>
      );
    }else{
      row = (
        <tr
          className={ClassNames('file', {
            pending: (this.props.action),
            dragging: (this.props.isDragging),
            dragover: (this.props.isOver),
            selected: (this.props.isSelected),
            "FileBrowser__large-dropzone": true
          }) + modifier}
        >
          <td colSpan="5">Drag and Drop files here</td>
        </tr>)
    }

    return this.connectDND(row);
  }
}

export default DragSource(
  'file',
  BaseFileConnectors.dragSource,
  BaseFileConnectors.dragCollect
)(
  DropTarget(
    ['file', 'folder', NativeTypes.FILE],
    BaseFileConnectors.targetSource,
    BaseFileConnectors.targetCollect
  )(
    TableFile
  )
)
