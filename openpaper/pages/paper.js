import React, { Component } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
      <div style={deleteBtn}>
        <span>X</span>
      </div>
      <div style={annoStyle}></div>
    </>
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
      annotating: true,
      annotations: [],
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

    if (annotating) {
      const newAnnotations = annotations.concat({ x: pageX, y: pageY });

      this.setState({ ...this.state, annotations: newAnnotations });
    }
  };

  componentWillUnmount() {
    document.removeEventListener("click", this.handlePageClick);
  }

  render() {
    const { file, numPages, scale, annotations } = this.state;

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
        </div>
      </div>
    );
  }
}

export default Paper;
