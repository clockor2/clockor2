import { useEffect } from 'react';
import { createBridge } from '@tabee/browser';
import { NEWICK_V1, normalizeFormatKey, registryCapability } from '@tabee/formats';
import { useAppDispatch } from '../../app/hooks';
import { ladderiseNewick } from '../engine/utils';
import { addNotification } from '../notifications/notificationsSlice';
import { setSource } from '../tree/treeSlice';

/**
 * Receives Newick trees from other tabEE-enabled browser applications.
 *
 * The bridge only starts a receiver when this page was opened with a tabEE
 * invitation (`#tabee=1&tabee-sid=…`), so loading Clockor2 normally is
 * unaffected. Consent is shown by the SDK before any file reaches this adapter.
 */
export function TabeeReceiver() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bridge = createBridge({
      application: {
        name: 'Clockor2',
        url: `${window.location.origin}${window.location.pathname}`,
      },
      normalizeFormatKey,
      imports: {
        [NEWICK_V1]: (files, context) => {
          const file = files[0];
          const newick =
            typeof file.data === 'string'
              ? file.data
              : new TextDecoder().decode(file.data);
          dispatch(setSource(ladderiseNewick(newick)));
          dispatch(
            addNotification({
              title: 'Tree received',
              message: `Imported ${file.name} from ${context.senderApplication} (${context.senderOrigin})`,
              type: 'info',
            }),
          );
        },
      },
      importCapabilities: {
        [NEWICK_V1]: registryCapability(NEWICK_V1, { maxFiles: 1 }),
      },
      onError: (error) => {
        dispatch(
          addNotification({
            title: 'tabEE transfer failed',
            message: `${error.code}: ${error.message}`,
            type: 'error',
          }),
        );
      },
    });
    return () => bridge.destroy();
  }, [dispatch]);

  return null;
}
