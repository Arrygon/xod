import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
import { explodeMaybe } from 'xod-func-tools';
import * as XP from 'xod-project';

const getSetOfPatchPaths = R.pipe(R.keys, x => new Set(x));

// :: (Patch -> Patch -> Boolean) -> [Patch] -> [Patch] -> Boolean
export const patchListEqualsBy = R.curry(
  (compFn, prevPatchesList, nextPatchesList) => {
    if (prevPatchesList === nextPatchesList) return true;
    if (prevPatchesList.length !== nextPatchesList.length) return false;

    const prevPatchesMap = R.indexBy(XP.getPatchPath, prevPatchesList);
    const nextPatchesMap = R.indexBy(XP.getPatchPath, prevPatchesList);

    const prevPatchPaths = getSetOfPatchPaths(prevPatchesMap);
    const nextPatchPaths = getSetOfPatchPaths(nextPatchesMap);
    const diffPatchPaths = new Set(
      [...prevPatchPaths].filter(x => !nextPatchPaths.has(x))
    );
    if (diffPatchPaths.size > 0) return false;

    return !R.any(pp => {
      const patchPath = XP.getPatchPath(pp);
      const np = nextPatchesMap[patchPath];
      return compFn(pp, np);
    })(prevPatchesList);
  }
);

// :: (Patch -> Patch -> Boolean) -> Maybe Patch -> Maybe Patch -> Boolean
export const maybePatchEqualsBy = R.curry(
  (compFn, prevMaybePatch, nextMaybePatch) => {
    if (prevMaybePatch === nextMaybePatch) return true;
    if (Maybe.isNothing(nextMaybePatch) || Maybe.isNothing(prevMaybePatch))
      return false;

    const prevPatch = explodeMaybe(
      'Imposible error: we just checked for Nothings',
      prevMaybePatch
    );
    const nextPatch = explodeMaybe(
      'Imposible error: we just checked for Nothings',
      nextMaybePatch
    );
    return compFn(prevPatch, nextPatch);
  }
);
