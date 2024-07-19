"use server"

import {WORKSPACE_DIR, set_WORKSPACE_DIR} from '@/config/env';

export const getWorkspaceDir = async () => WORKSPACE_DIR();
export const setWorkspaceDir = async (dir: string) => set_WORKSPACE_DIR(dir);