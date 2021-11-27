import React, { Component, useRef } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import axios from "axios";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import * as styles from "../styles/paper.module.scss";

const _ = require("lodash");

const Annotation = ({ x, y }) => {
  const WIDTH = 50;
  const HEIGHT = 50;

  const annoStyle = {
    position: "absolute",
    left: x - WIDTH / 2,
    top: y - HEIGHT / 2,
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
    border: "2px solid #f7ea36",
    backgroundColor: "#f7ea3630",
  };

  const deleteBtn = {
    position: "absolute",
    left: x + WIDTH / 2 - 10,
    top: y - HEIGHT / 2 - 10,
    width: `20px`,
    height: `20px`,
    borderRadius: "50%",
    backgroundColor: "#00000090",
    color: "white",
    textAlign: "center",
    zIndex: 3,
  };

  return (
    <>
      <div style={annoStyle}></div>
    </>
  );
};

const NewAnnotationEditor = ({ submit, cancel }) => {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  return (
    <div className={styles.newEditor}>
      <h1>New annotation</h1>

      <h2>Annotation title</h2>
      <input ref={titleRef} type="text" />

      <h2>Annotation body</h2>
      <textarea ref={bodyRef}></textarea>

      <div>
        <button onClick={cancel}>Cancel</button>
        <button
          onClick={() => submit(titleRef.current.value, bodyRef.current.value)}
        >
          Save
        </button>
      </div>
    </div>
  );
};

class Paper extends Component {
  constructor(props) {
    super(props);

    this.refs = {};
    this.state = {
      scale: 2.0,
      file: "./sample.pdf",
      numPages: null,
      annotating: false, // if currently creating an annotation
      annotations: [],
      currentAnno: null,
    };
  }

  setFile = (file) => {
    this.setState({ ...this.state, file });
  };

  setScale = (scale) => {
    this.setState({ ...this.state, scale });
  };

  setNumPages = (pages) => {
    this.setState({ ...this.state, numPages: pages });
  };

  onDocumentLoadSuccess = ({ numPages }) => {
    console.log(numPages);
    this.setNumPages(numPages);
    this.refs = {};
    for (const pg of Array(numPages).keys()) {
      this.refs[`page${pg}`] = React.createRef();
    }
  };

  round = (num, digits) => {
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
  };

  handlePageClick = (e, ref) => {
    window.getSelection().removeAllRanges();

    console.log(e);

    const { annotating, annotations } = this.state;

    const pageX = e.nativeEvent.pageX;
    const pageY = e.nativeEvent.pageY;

    console.log(pageX, pageY);

    if (!annotating) {
      this.setState({
        ...this.state,
        currentAnno: { x: pageX, y: pageY },
        annotating: true,
      });
    }
  };

  componentWillUnmount() {
    document.removeEventListener("click", this.handlePageClick);
  }

  // TODO: fill with values
  createNewAnnotation = async (title, body) => {
    console.log("submitted");
    // TODO: submit to server, update visuals when server responds

    const form = new FormData();
    form.append("x", this.state.currentAnno.x);
    form.append("y", this.state.currentAnno.y);
    form.append("title", title);
    form.append("body", body);

    try {
      const resp = await axios({
        method: "POST",
        url: "http://localhost:5000/add",
        data: form,
        headers: { "Content-Type": "x-www-form-urlencoded" },
      });
      console.log(resp);
      const newAnnotations = this.state.annotations.concat({
        x: resp.data.x,
        y: resp.data.y,
      });

      this.setState({
        ...this.state,
        annotating: false,
        currentAnno: null,
        annotations: newAnnotations,
      });
    } catch {
      this.setState({
        ...this.state,
        annotating: false,
        currentAnno: null,
      });
    }
  };

  cancelNewAnnotation = () => {
    console.log("cancelled");
    this.setState({ ...this.state, annotating: false, currentAnno: null });
  };

  render() {
    const { file, numPages, scale, annotations, annotating, currentAnno } =
      this.state;

    return (
      <div>
        <div className={styles.document}>
          <Document
            renderMode="svg"
            file={file}
            onLoadSuccess={(e) => this.onDocumentLoadSuccess(e)}
          >
            {_.range(1, numPages + 1).map((page) => (
              <>
                <Page
                  canvasRef={this.refs[`page${page}`]}
                  onClick={(e) =>
                    this.handlePageClick(e, this.refs[`page${page}`])
                  }
                  key={page}
                  scale={scale}
                  pageNumber={page}
                  renderTextLayer={true}
                />

                <hr />
              </>
            ))}
          </Document>
        </div>

        <div>
          {annotations.map((anno) => (
            <Annotation x={anno.x} y={anno.y} />
          ))}
          {currentAnno ? (
            <Annotation x={currentAnno.x} y={currentAnno.y} />
          ) : null}
        </div>

        {annotating ? (
          <NewAnnotationEditor
            cancel={() => this.cancelNewAnnotation()}
            submit={(title, body) => this.createNewAnnotation(title, body)}
          />
        ) : null}
      </div>
    );
  }
}

export default Paper;
