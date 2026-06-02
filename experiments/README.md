# Experiment Protocol

Each change that touches UI layout, surface, image, or motion must live under:

```
experiments/YYYY-MM-DD-short-task-name/
  plan.md
  result.md
```

Copy `_template/` to start a new experiment.

## Rules

1. One layer per experiment (see `docs/KARPATHY_STYLE_AUDIT.md`).
2. Edit reference pages first; production pages only after reference screenshots pass.
3. Always record **keep** or **revert** in `result.md`.
4. Do not delete experiment folders — they are the audit trail.

## Quick start

```bash
cp -r experiments/_template experiments/$(date +%Y-%m-%d)-my-task
# edit plan.md, implement, run audits, fill result.md
```
