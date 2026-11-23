import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/** Typed versions of useDispatch / useSelector for this app's store. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
