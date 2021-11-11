import React, { Component } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import * as styles from "../styles/paper.module.scss";

const _ = require("lodash");

class Paper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 2.0,
      file: "./sample.pdf",
      numPages: null,
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
  };

  round = (num, digits) => {
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
  };

  render() {
    const { file, numPages, scale } = this.state;
    return (
      <div>
        <div className={styles.document}>
          <Document
            renderMode="canvas"
            file={file}
            onLoadSuccess={(e) => this.onDocumentLoadSuccess(e)}
          >
            {_.range(1, numPages + 1).map((page) => (
              <Page
                key={page}
                scale={scale}
                pageNumber={page}
                renderTextLayer={true}
              />
            ))}
          </Document>
        </div>

        <div className={styles.controls}>
          <p>scale: {scale}</p>
          <button onClick={() => this.setScale(this.round(scale - 0.1, 1))}>
            -
          </button>
          <button onClick={() => this.setScale(this.round(scale + 0.1, 1))}>
            +
          </button>
        </div>
      </div>
    );
  }
}

export default Paper;
