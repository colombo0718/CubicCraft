      var kernal={
        type:"model",
        unite:[
          {x: 1,y: 1,color:"#0ff"},
          {x: 0,y: 1,color:"#ff0"},
          {x:-1,y: 1,color:"#0ff"},
          {x: 1,y: 0,color:"#ff0"},
          {x: 0,y: 0,color:"#0ff"},
          {x:-1,y: 0,color:"#ff0"},
          {x: 1,y:-1,color:"#ff0"},
          {x: 0,y:-1,color:"#0ff"},
          {x:-1,y:-1,color:"#ff0"},

          {x: 2,y: 0,color:"#f0f"},
          {x:-3,y: 0,color:"#f0f"},
          {x:-2,y: 0,color:"#f0f"},
          {x: 3,y: 0,color:"#f0f"},
          {x: 0,y: 2,color:"#f0f"},
          {x: 0,y: 3,color:"#f0f"},
          {x: 0,y:-2,color:"#f0f"},
          {x: 0,y:-3,color:"#f0f"},

          // {x: 100,y:30,color:"#f0f"},
        ],
        engines:[
          {name:"up" ,len:2,dir:3,x: 0,y:-4},
          {name:"down" ,len:2,dir:1,x: 0,y: 4},
          {name:"left" ,len:2,dir:0,x: 4,y: 0},
          {name:"right",len:2,dir:2,x:-4,y: 0},
        ]
      }
      var double={
        type:"model",
        unite:[
          {x: 1,y: 1,color:"#0ff"},
          {x: 0,y: 1,color:"#ff0"},
          {x:-1,y: 1,color:"#0ff"},
          {x: 1,y: 0,color:"#ff0"},
          {x: 0,y: 0,color:"#0ff"},
          {x:-1,y: 0,color:"#ff0"},
          {x: 1,y:-1,color:"#ff0"},
          {x: 0,y:-1,color:"#0ff"},
          {x:-1,y:-1,color:"#ff0"},

          {x: 2,y: 0,color:"#ffffff"},
          {x: 3,y: 0,color:"#ffffff"},
          {x: 4,y: 0,color:"#ffffff"},
          {x:-2,y: 0,color:"#ffffff"},
          {x:-3,y: 0,color:"#ffffff"},
          {x:-4,y: 0,color:"#ffffff"},

          {x: 4,y: 1,color:"#f0f"},
          {x: 4,y: 2,color:"#f0f"},
          {x: 4,y:-1,color:"#f0f"},
          {x: 4,y:-2,color:"#f0f"},
          {x:-4,y: 1,color:"#f0f"},
          {x:-4,y: 2,color:"#f0f"},
          {x:-4,y:-1,color:"#f0f"},
          {x:-4,y:-2,color:"#f0f"},
        ],
        engines:[
          {name:"bRight"   ,len:2,dir:1,x: 4,y: 3},
          {name:"fRight" ,len:2,dir:3,x: 4,y:-3},
          {name:"bLeft" ,len:2,dir:1,x:-4,y: 3},
          {name:"fLeft",len:2,dir:3,x:-4,y:-3},
        ]
      }

      var fighter={
        type:"model",
        unite:[
          {x: 1,y: 1,color:"#0ff"},
          {x: 0,y: 1,color:"#ff0"},
          {x:-1,y: 1,color:"#0ff"},
          {x: 1,y: 0,color:"#ff0"},
          {x: 0,y: 0,color:"#0ff"},
          {x:-1,y: 0,color:"#ff0"},
          {x: 1,y:-1,color:"#ff0"},
          {x: 0,y:-1,color:"#0ff"},
          {x:-1,y:-1,color:"#ff0"},

          {x: 0,y: 2,color:"#ffffff"},
          {x: 0,y: 3,color:"#ffffff"},
          {x: 3,y:-2,color:"#ffffff"},
          {x:-3,y:-2,color:"#ffffff"},
          
          
          // Major
          {x: 0,y:-2,color:"#f0f"},
          {x: 0,y:-3,color:"#f0f"},
          {x: 0,y:-4,color:"#f0f"},
          // mr
          {x: 1,y:-2,color:"#f0f"},
          {x: 1,y:-3,color:"#f0f"},
          // ml
          {x:-1,y:-2,color:"#f0f"},
          {x:-1,y:-3,color:"#f0f"},
          // br
          {x: 2,y:-2,color:"#f0f"},
          {x: 2,y:-1,color:"#f0f"},
          // bl
          {x:-2,y:-2,color:"#f0f"},
          {x:-2,y:-1,color:"#f0f"},
          // Right
          {x: 4,y:-1,color:"#f0f"},
          {x: 4,y:-2,color:"#f0f"},
          {x: 5,y:-2,color:"#f0f"},
          {x: 5,y:-3,color:"#f0f"},
          // Left
          {x:-4,y:-1,color:"#f0f"},
          {x:-4,y:-2,color:"#f0f"},
          {x:-5,y:-2,color:"#f0f"},
          {x:-5,y:-3,color:"#f0f"},
        ],
        engines:[
          {name:"Major"   ,len:3,dir:3,x: 0,y:-5},
          {name:"mr" ,len:2,dir:3,x: 1,y:-4},
          {name:"ml" ,len:2,dir:3,x:-1,y:-4},
          {name:"Right" ,len:2,dir:3,x: 4,y:-3},
          {name:"Left"  ,len:2,dir:3,x:-4,y:-3},
          {name:"br" ,len:2,dir:1,x: 2,y: 0},
          {name:"bl" ,len:2,dir:1,x:-2,y: 0},
          {name:"or" ,len:2,dir:1,x: 5,y:-1},
          {name:"ol" ,len:2,dir:1,x:-5,y:-1},
        ]
      }
