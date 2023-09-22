import { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { Input } from "./components/Input.jsx";
import { Output } from "./components/Output.jsx";

import { SAMPLE_LABELS, SAMPLE_MODIFIED, SAMPLE_ORIGINAL } from "./data.js";

import pythonScript from "./main.py?raw";

function bridge(fn) {
  function inner(input) {
    const rawInput = JSON.stringify(input);
    const rawOutput = fn(rawInput);
    return JSON.parse(rawOutput);
  }

  return inner;
}

export default function App() {
  const [pythonFunctions, setPythonFunctions] = useState(null);

  const [inputOriginal, setInputOriginal] = useState(SAMPLE_ORIGINAL);
  const [inputModified, setInputModified] = useState(SAMPLE_MODIFIED);
  const [inputLabels, setInputLabels] = useState(SAMPLE_LABELS);

  const [outputOriginal, setOutputOriginal] = useState(null);
  const [outputModified, setOutputModified] = useState(null);
  const [outputLabels, setOutputLabels] = useState(null);

  const [outputOriginalMissing, setOutputOriginalMissing] = useState([]);
  const [outputModifiedMissing, setOutputModifiedMissing] = useState([]);

  function setUpPython() {
    loadPyodide().then((py) => {
      py.runPython(pythonScript);
      setPythonFunctions({
        extractLabels: bridge(py.globals.get("extract_labels")),
        extractLayout: bridge(py.globals.get("extract_layout")),
        extractMissing: bridge(py.globals.get("extract_missing")),
      });
    });
  }

  function updateInputOriginal(e) {
    setInputOriginal(e.target.value);
  }

  function updateInputModified(e) {
    setInputModified(e.target.value);
  }

  function updateInputLabels(e) {
    setInputLabels(e.target.value);
  }

  function updateOutputOriginal() {
    if (pythonFunctions) setOutputOriginal(pythonFunctions.extractLayout({ raw: inputOriginal }));
  }

  function updateOutputModified() {
    if (pythonFunctions) setOutputModified(pythonFunctions.extractLayout({ raw: inputModified }));
  }

  function updateOutputLabels() {
    if (pythonFunctions) setOutputLabels(pythonFunctions.extractLabels({ raw: inputLabels }));
  }

  function updateOutputOriginalMissing() {
    if (pythonFunctions)
      setOutputOriginalMissing(
        pythonFunctions.extractMissing({
          this: outputOriginal.ids || [],
          other: outputModified.ids || [],
        }),
      );
  }

  function updateOutputModifiedMissing() {
    if (pythonFunctions)
      setOutputModifiedMissing(
        pythonFunctions.extractMissing({
          this: outputModified.ids || [],
          other: outputOriginal.ids || [],
        }),
      );
  }

  function updateOutput() {
    updateOutputOriginal();
    updateOutputModified();
    updateOutputLabels();
  }

  useEffect(setUpPython, []);

  useEffect(updateOutput, [pythonFunctions]);

  useEffect(updateOutputOriginal, [inputOriginal]);
  useEffect(updateOutputModified, [inputModified]);
  useEffect(updateOutputLabels, [inputLabels]);

  useEffect(updateOutputOriginalMissing, [outputOriginal, outputModified]);
  useEffect(updateOutputModifiedMissing, [outputOriginal, outputModified]);

  return (
    <>
      <Tabs defaultActiveKey="original">
        <Tab disabled title="Data:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"></Tab>
        <Tab eventKey="original" title="Original">
          <Input onChange={updateInputOriginal} value={inputOriginal} />
        </Tab>
        <Tab eventKey="modified" title="Modified">
          <Input onChange={updateInputModified} value={inputModified} />
        </Tab>
        <Tab eventKey="labels" title="Labels">
          <Input onChange={updateInputLabels} value={inputLabels} />
        </Tab>
      </Tabs>
      <Tabs className="mt-3" defaultActiveKey="original">
        <Tab disabled title="Render:"></Tab>
        <Tab eventKey="original" title="Original">
          <Output labels={outputLabels} layout={outputOriginal} missing={outputOriginalMissing} />
        </Tab>
        <Tab eventKey="modified" title="Modified">
          <Output labels={outputLabels} layout={outputModified} missing={outputModifiedMissing} />
        </Tab>
      </Tabs>
    </>
  );
}
