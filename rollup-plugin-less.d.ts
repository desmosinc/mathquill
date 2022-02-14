declare module "rollup-plugin-less" {
    
    interface RollupPluginLessOptions {
        insert?: boolean,
        watch?: boolean,
        option?: {
            filename?: string
        },
        output?: string | boolean | (() => string),
        include?: string | string[],
        exclude?: string | string[]
    }

    import type { Plugin } from 'rollup';
    function plugin(options: RollupPluginLessOptions): Plugin
    export = plugin
}