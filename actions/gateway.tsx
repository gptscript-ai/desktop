"use server"

import { GATEWAY_URL } from '@/config/env';

export const getGatewayUrl = async () => GATEWAY_URL();