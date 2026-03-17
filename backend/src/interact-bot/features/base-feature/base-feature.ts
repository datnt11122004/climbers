import { Composer } from 'grammy';
import type { Context } from '#root/interact-bot/context';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseFeature extends Composer<Context> {
    constructor() {
        super();
    }

    private static COMMAND: string;
    private static ALIAS: string[];

    public set COMMAND(value: string) {
        BaseFeature.COMMAND = value;
    }

    public set ALIAS(value: string[]) {
        BaseFeature.ALIAS = value;
    }

    public get COMMAND(): string {
        return BaseFeature.COMMAND;
    }

    public get ALIAS(): string[] {
        return BaseFeature.ALIAS;
    }
}
