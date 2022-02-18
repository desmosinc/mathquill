import typescript from '@rollup/plugin-typescript';
import copy from "rollup-plugin-copy"
import less from 'rollup-plugin-less';
import serve from 'rollup-plugin-serve'

export default {
    input: 'src/main.ts',
    output: {
      file: 'build/mathquill.js',
      format: 'umd',
      name: "MQ"
    },
    plugins: [
      typescript(),
      copy({
        targets: [
          { src: "test/basic.html", dest: "build" },
          { src: "test/demo.html", dest: "build" },
          { src: "test/digit-grouping.html", dest: "build" },
          { src: "test/unit.html", dest: "build" },
          { src: "test/visual.html", dest: "build" },
          { src: "test/support", dest: "build" },
          { src: "src/fonts", dest: "build" },
          
        ]
      }),
      less({
        output: "mathquill.css"
      }),
	  serve("test")
    ]
};