# MaizeScan web app (prototype)

Static web app: no server code. The model runs in the browser with TensorFlow.js.

```
docs/
  index.html      the app (camera, upload, result screen)
  logic.js        decision rules (leaf check -> disease)
  vendor/tf.min.js  TensorFlow.js, bundled so the app works offline
  config.json     class names and thresholds   <- created by Notebook 3
  model/          model.json + weights         <- created by Notebook 3
```

## Run it on your computer
Open a terminal in the `docs` folder and run:

    python -m http.server 8000

then open http://localhost:8000 in Chrome or Edge. (Opening index.html by double-clicking will NOT work.)

## Publish it (needed for a phone camera)
GitHub repo > Settings > Pages > Build and deployment > Deploy from a branch >
branch `main`, folder `/docs` > Save. After a minute the app is at
https://YOUR-USERNAME.github.io/REPO-NAME/

## How it decides
The model returns 5 numbers: a leaf-check score, then the probabilities of the 4 classes.
- leaf-check score below `gate_threshold`  -> error: "this is not a maize leaf"
- otherwise, top class below `min_disease_confidence` -> "maize leaf, but uncertain"
- otherwise -> the diagnosis

## Tests
    node tests/test_logic.js
