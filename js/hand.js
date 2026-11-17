/* Rivière (4BR, 30.25 × 14.2 m) — hand-built residence model.
   Read off the unit plan at 1:1: every wall, opening, finish and piece of furniture is placed in plan pixels
   and converted to metres in the module frame (origin = back-left corner, x → right, z → river, y up). */
(function () {
  let OX = 0, OY = 0, SX = 1, SZ = 1; // plan frame of the residence being built
  const X = (px) => (px - OX) * SX, Z = (py) => (py - OY) * SZ;
  const SPEC = {};
  const H = 2.5; // wall height in the cutaway (no ceiling)

  // ------------------------------------------------------------------ plan data (px on the 1509×961 plan)
  // ================================================================== Rivière (4BR, plan 1509×961)
  {
    const R = (SPEC.riviere = { w: 30.25, d: 14.2, frame: [45, 18, 30.25 / 1365, 14.2 / 642] });
  // walls [x0, y0, x1, y1]
  R.WALLS = [
    [47, 239, 62, 578], [47, 239, 190, 250],                       // west façade, walk-in back wall
    [233, 137, 245, 277], [233, 137, 302, 145],                    // bathroom 4
    [302, 80, 317, 222], [302, 262, 317, 277],                     // bath 4 / bedroom 4 (door gap)
    [452, 80, 462, 277],                                           // bedroom 4 / wet kitchen
    [245, 268, 320, 277], [365, 268, 452, 277],                    // bedroom 4 front (door gap)
    [462, 128, 580, 138],                                          // AC ledge / wet kitchen
    [577, 80, 587, 182], [577, 212, 587, 270],                     // wet kitchen / yard (door gap)
    [580, 210, 614, 217], [580, 265, 680, 272], [672, 177, 680, 270], // maid toilet
    [667, 80, 680, 145],                                           // yard / maid bedroom
    [680, 185, 777, 192], [680, 266, 745, 276],                    // maid bedroom / shoe room
    [777, 30, 787, 276],                                           // service core / foyer
    [777, 28, 980, 37], [787, 118, 800, 128], [845, 118, 862, 128], // powder room
    [860, 30, 872, 160], [967, 30, 980, 160],                      // private lift shaft
    [860, 150, 885, 160], [955, 150, 1020, 160],                   // lift doors
    [860, 160, 872, 185], [860, 245, 872, 270], [865, 262, 1020, 270], // foyer / lift lobby
    [1002, 150, 1017, 165], [1002, 240, 1017, 270],                // lobby entrance (double door gap)
    [245, 145, 268, 175], [62, 420, 90, 460], [990, 415, 1002, 455], // service shafts in bathrooms 4, J. master, 3
    [62, 322, 112, 330], [150, 307, 160, 512], // junior master bath (door from the walk-in)
    [311, 268, 324, 275], [311, 307, 324, 637],                    // junior master suite / living (door gap)
    [780, 322, 885, 332], [925, 322, 1002, 332], [780, 332, 790, 512], // bedroom 3
    [927, 357, 937, 460], [937, 455, 1002, 462], // bathroom 3 (door at the top of its west wall)
    [1002, 235, 1017, 275], [1002, 322, 1017, 572],                // master wing west wall (door gap)
    [1002, 235, 1410, 245], [1395, 235, 1410, 665],                // master wing north + east façade
    [1017, 245, 1067, 272], [1345, 245, 1395, 272],                // service shafts in the walk-in
    [1017, 322, 1075, 332], [1105, 322, 1155, 332], [1145, 332, 1155, 490], // master bath
    [598, 508, 666, 526], [755, 508, 793, 520],                    // façade columns
  ];
  // floor finishes [x0, y0, x1, y1]
  R.FLOORS = {
    oak: [[62, 248, 311, 322], [160, 322, 311, 512], [317, 86, 452, 270], [680, 86, 777, 185], [788, 330, 930, 507],
      [1017, 243, 1395, 330], [1155, 330, 1395, 572]],
    marble: [[324, 270, 780, 512], [780, 270, 1017, 330], [462, 138, 580, 277], [587, 86, 667, 212], [680, 192, 777, 270],
      [787, 128, 862, 277], [862, 160, 1012, 270], [311, 275, 324, 307], [930, 460, 937, 507]],
    bath: [[245, 142, 302, 270], [62, 330, 152, 512], [587, 217, 672, 267], [787, 37, 860, 120], [937, 332, 1002, 460],
      [1017, 330, 1147, 572], [652, 175, 672, 210]],
    stone: [[62, 512, 311, 575], [462, 86, 577, 128]],
    lift: [[872, 37, 967, 150]],
    deck: [[324, 512, 1002, 548], [324, 548, 608, 637], [550, 637, 608, 660], [952, 548, 1002, 662], [608, 655, 952, 662],
      [937, 460, 1002, 512], [1002, 572, 1395, 666]],
  };
  // thresholds under door openings and glazing lines (drawn a hair above the room floors)
  R.FILL = { marble: [[652, 210, 672, 217]] };
  R.DOORS = [[1005, 165, 1014, 240]];
  R.SILLS = {
    oak: [[302, 222, 317, 262], [112, 320, 150, 332], [925, 332, 939, 357], [190, 236, 233, 250], [1143, 488, 1157, 574], [788, 505, 939, 514]],
    marble: [[578, 180, 589, 214], [587, 208, 652, 219], [665, 143, 682, 187], [798, 116, 847, 130], [883, 148, 957, 162], [1000, 163, 1019, 242]],
  };
  R.POOL = [608, 548, 952, 655];
  // façade glazing (floor-to-ceiling, framed)
  R.GLAZING = [
    [[317, 84], [452, 84]], [[462, 84], [577, 84]], [[680, 84], [777, 84]],    // north: bedroom 4, AC ledge screen, maid bedroom
    [[190, 244], [233, 244]],                                                  // walk-in side window
    [[62, 512], [311, 512]],                                                   // junior master suite → loggia
    [[324, 512], [598, 512]], [[666, 512], [755, 512]],                        // living / dining / kitchen → deck
    [[790, 509], [930, 509]], [[932, 462], [932, 509]],                        // bedroom 3
    [[1017, 572], [1395, 572]], [[1150, 490], [1150, 572]],                    // master bath + bedroom → deck
  ];
  // glass partitions (showers, wet-kitchen screen) [[x0,y0],[x1,y1], height]
  R.PARTITIONS = [
    [[90, 420], [124, 420], 2.0],
    [[937, 415], [977, 415], 2.0], [[977, 415], [977, 455], 2.0],
    [[1020, 375], [1065, 375], 2.0], [[1065, 375], [1065, 440], 2.0],
  ];
  R.RAILS = [[[62, 574], [311, 574]], [[324, 637], [550, 637]], [[550, 637], [550, 662]], [[550, 663], [1002, 663]], [[1024, 665], [1395, 665]]];
  // warm room lights [x, y, intensity]
  R.LIGHTS = [[420, 410, 9], [575, 410, 8], [690, 415, 7], [250, 410, 7], [1290, 430, 9], [850, 420, 6], [395, 170, 6],
    [1080, 440, 6], [520, 205, 5], [870, 220, 5]];

  }

  // ================================================================== Jardin (3BR, plan 1536×1213)
  {
    const J = (SPEC.jardin = { w: 21.55, d: 15.45, frame: [125, 395, 21.55 / 820, 15.45 / 590] });
    J.WALLS = [
      [125, 535, 137, 560], [125, 600, 137, 893],                 // west façade (lobby entrance gap)
      [157, 442, 327, 450], [157, 442, 167, 542],                  // lift shaft
      [247, 442, 257, 542], [125, 535, 190, 542], [235, 535, 257, 542], // lift / powder, lift doors
      [317, 442, 327, 532], [257, 525, 280, 532], [312, 525, 327, 532], // powder room (door gap)
      [250, 535, 260, 555], [250, 600, 260, 647],                  // lobby / entry terrace (door gap)
      [137, 640, 250, 647],                                        // lobby / shoe room
      [410, 487, 420, 647], [410, 487, 600, 495],                  // terrace / yard, north wall
      [490, 495, 497, 570], [490, 597, 497, 645],                  // yard / wet kitchen (door gap)
      [420, 597, 440, 603], [470, 597, 497, 603], [420, 637, 497, 645], // storage
      [497, 520, 592, 528],                                        // AC ledge / wet kitchen
      [592, 487, 600, 647],                                        // wet kitchen / bedroom 2
      [600, 640, 677, 647],                                        // bedroom 2 front (door gap)
      [712, 485, 720, 609], [712, 636, 720, 649], [720, 527, 785, 535], [777, 527, 785, 649], [712, 642, 785, 649], // bathroom 2 (door from bedroom 2)
      [755, 535, 777, 560], [755, 560, 777, 577],                  // shaft + shower nib in bathroom 2
      [137, 765, 155, 800], [917, 770, 930, 798], [196, 680, 201, 692], // shafts in bathroom 3 + master bath, shoe room nib
      [785, 617, 942, 625], [930, 617, 942, 902],                  // master wing north + east façade
      [707, 690, 720, 947],                                        // living / master suite
      [847, 690, 862, 697], [895, 690, 930, 697], [847, 697, 855, 902], [847, 895, 942, 902], // master bath
      [140, 690, 200, 697], [235, 690, 325, 697],                  // bedroom 3 front (door gap)
      [195, 730, 202, 850], [137, 800, 202, 807],                  // bathroom 3, AC ledge closed off from bedroom 3
      [317, 697, 325, 850],                                        // bedroom 3 / gallery kitchen
      [435, 850, 445, 968],                                       // deck west column
    ];
    J.FLOORS = {
      oak: [[600, 495, 712, 640], [202, 697, 317, 845], [720, 645, 785, 695], [785, 625, 930, 695], [720, 695, 847, 848]],
      marble: [[325, 645, 707, 845], [137, 645, 325, 697], [137, 542, 250, 640], [260, 532, 410, 642], [420, 495, 490, 597],
        [420, 603, 490, 637], [497, 528, 592, 645], [490, 645, 600, 647], [600, 647, 707, 697]],
      bath: [[257, 450, 317, 525], [720, 535, 777, 642], [140, 697, 195, 800], [855, 697, 930, 895]],
      stone: [[497, 495, 592, 520], [720, 848, 847, 890], [137, 850, 435, 890], [140, 807, 202, 850]],
      lift: [[167, 450, 247, 535]],
      deck: [[445, 850, 707, 946], [445, 946, 560, 968]],
      garden: [[322, 398, 410, 525]],
    };
    J.FILL = { marble: [[327, 525, 410, 532], [257, 532, 260, 535], [325, 845, 707, 850]], bath: [[137, 697, 140, 807]], stone: [[137, 807, 140, 850]] };
    J.DOORS = [[127, 560, 135, 600]];
    J.SILLS = {
      marble: [[125, 560, 137, 600], [190, 535, 235, 542], [250, 555, 260, 600], [490, 570, 497, 597], [280, 525, 312, 532],
        [440, 597, 470, 603], [260, 640, 410, 647], [707, 645, 720, 690]],
      oak: [[677, 640, 712, 647], [200, 690, 235, 697], [195, 697, 202, 730], [862, 690, 895, 697], [202, 843, 317, 850], [720, 845, 847, 851]],
      bath: [[712, 609, 720, 636]],
    };
    J.GLAZING = [
      [[600, 491], [712, 491]],                     // bedroom 2 north
      [[497, 491], [592, 491]],                     // AC ledge screen
      [[260, 643], [410, 643]],                     // entry terrace → home
      [[202, 846], [317, 846]], [[325, 846], [707, 846]], [[720, 849], [847, 849]], // river façade
    ];
    J.PARTITIONS = [
      [[720, 574], [755, 574], 2.0],
      [[855, 787], [900, 787], 2.0], [[900, 787], [900, 830], 2.0],
      [[152, 765], [195, 765], 2.0],
    ];
    J.RAILS = [[[137, 889], [435, 889]], [[322, 399], [410, 399]], [[720, 890], [847, 890]], [[560, 947], [707, 947]], [[445, 968], [560, 968]], [[560, 947], [560, 968]]];
    J.LIGHTS = [[620, 760, 9], [500, 760, 8], [410, 765, 7], [650, 565, 6], [265, 770, 6], [785, 770, 8], [890, 800, 5], [545, 590, 5], [195, 590, 5], [850, 660, 5]];
  }

  // ================================================================== Penthouse (4BR + pool pavilion, plan 1200×574)
  {
    const P = (SPEC.penthouse = { w: 51.45, d: 15.45, frame: [59, 101, 51.45 / 1050, 15.45 / 315] });
    P.WALLS = [
      // junior master suite
      [60, 225, 68, 377], [60, 225, 145, 230], [60, 262, 92, 267], [107, 262, 111, 370], [60, 370, 111, 377],
      // bathroom 4 + bedroom 4
      [145, 180, 150, 247], [145, 180, 187, 185], [145, 242, 187, 247], [183, 155, 188, 195], [183, 218, 188, 247],
      [245, 155, 250, 245], [207, 240, 250, 245],
      // service: AC ledge, wet kitchen, yard, maid toilet, maid bedroom, shoe room
      [250, 175, 300, 180], [300, 148, 305, 195], [300, 212, 305, 245], [300, 148, 343, 152],
      [300, 213, 318, 218], [332, 213, 343, 218], [300, 240, 372, 245],
      [338, 100, 343, 150], [338, 170, 343, 245], [338, 100, 392, 105], [387, 100, 392, 177], [343, 172, 387, 177],
      // foyer, powder room 1, lift 1, lift lobby 1
      [387, 173, 392, 245], [392, 130, 426, 135], [392, 170, 400, 174], [415, 170, 426, 174],
      [426, 128, 431, 190], [426, 128, 480, 133], [475, 128, 480, 190], [431, 185, 440, 190], [468, 185, 497, 190],
      [423, 190, 428, 193], [423, 223, 428, 240], [490, 187, 497, 240], [427, 233, 497, 240],
      [497, 230, 520, 240], [643, 230, 665, 240],                  // corridor north: columns with a window between
      // lift 2, lift lobby 2, powder room 2
      [685, 128, 737, 133], [685, 128, 690, 190], [732, 128, 737, 190], [665, 185, 700, 190], [723, 185, 737, 190], [672, 228, 733, 233],
      [665, 187, 672, 240], [733, 187, 738, 200], [733, 225, 738, 240],
      [737, 130, 773, 135], [768, 130, 773, 174], [737, 170, 745, 174], [760, 170, 773, 174],
      // rooms along the corridor (door gaps: bedroom 3, master walk-in)
      [390, 262, 432, 268], [455, 262, 560, 268], [577, 262, 737, 268],
      [180, 262, 187, 412], [390, 262, 395, 352],
      [455, 298, 460, 362], [460, 298, 465, 303], [480, 298, 497, 303], [455, 357, 493, 362], [492, 262, 497, 413], // bathroom 3
      [497, 298, 515, 303], [535, 298, 555, 303], [550, 303, 555, 413], [497, 410, 550, 415], // master bath
      [665, 262, 672, 418], [733, 262, 738, 268],                  // master bedroom / tea room (glass doors to the pool deck)
      // pool pavilion
      [818, 153, 1022, 158], [818, 153, 823, 237], [982, 153, 988, 206], [988, 175, 1015, 180], [1015, 175, 1020, 238], [988, 201, 1015, 206], // pavilion + AC ledge closed off
      // east screens + edge columns
    ];
    P.FLOORS = {
      oak: [[68, 230, 145, 262], [145, 247, 180, 262], [111, 262, 180, 348], [188, 160, 245, 240], [343, 105, 380, 172],
        [395, 267, 455, 350], [455, 267, 492, 298], [497, 267, 665, 298], [555, 298, 665, 410], [672, 267, 733, 350]],
      marble: [[187, 262, 390, 352], [188, 240, 392, 262], [383, 237, 737, 264], [250, 180, 300, 240], [305, 152, 338, 213],
        [305, 218, 338, 240], [343, 177, 387, 240], [392, 173, 423, 240], [428, 190, 490, 233], [672, 190, 733, 240], [823, 158, 1015, 235]],
      bath: [[68, 267, 107, 370], [150, 185, 183, 242], [392, 135, 426, 170], [460, 303, 488, 357], [497, 303, 550, 410],
        [738, 135, 768, 170], [773, 143, 822, 173]],
      stone: [[111, 348, 180, 370], [250, 160, 300, 175], [988, 180, 1015, 205]],
      lift: [[431, 133, 475, 185], [690, 133, 732, 185]],
      deck: [[187, 352, 338, 413], [338, 352, 452, 372], [452, 352, 492, 413], [672, 352, 737, 413], [555, 410, 672, 418],
        [737, 173, 805, 413], [773, 237, 1100, 272], [805, 387, 980, 398], [1083, 272, 1100, 372], [980, 368, 1083, 372]],
      garden: [[773, 107, 822, 143], [978, 353, 1097, 368]],
    };
    P.FILL = { oak: [[733, 268, 738, 352], [380, 105, 387, 172], [395, 350, 455, 352], [672, 350, 733, 352]], bath: [[737, 135, 738, 170], [488, 303, 492, 352]],
      marble: [[423, 174, 426, 190], [480, 187, 490, 190], [672, 187, 685, 190], [823, 235, 1015, 237], [180, 247, 188, 262]], deck: [[805, 173, 818, 237], [550, 413, 555, 415]] };
    P.SILLS = {
      marble: [[300, 195, 305, 212], [318, 213, 332, 218], [372, 240, 387, 245], [338, 150, 343, 170], [440, 185, 468, 190],
        [423, 193, 428, 223], [700, 185, 723, 190], [733, 200, 738, 225],
        [400, 170, 415, 174], [745, 170, 760, 174]],
      oak: [[432, 262, 455, 268], [560, 262, 577, 268], [182, 240, 207, 245]],
      bath: [[92, 262, 107, 267], [183, 195, 188, 218], [465, 298, 480, 303], [515, 298, 535, 303]],
    };
    P.POOL = [[805, 272, 1070, 333], [805, 333, 978, 387, 1], [978, 333, 1083, 353], [1070, 272, 1083, 333], [338, 372, 452, 412]];
    P.GLAZING = [
      [[111, 349], [180, 349]], [[187, 353], [390, 353]], [[395, 351], [455, 351]], [[555, 411], [665, 411]], [[672, 351], [733, 351]], [[735, 268], [735, 351]],
      [[188, 157], [245, 157]], [[343, 102], [380, 102]], [[250, 157], [300, 157]], [[823, 235], [1015, 235]], [[520, 236], [643, 236]],
    ];
    P.PARTITIONS = [
      [[68, 307], [88, 307], 2.0], [[150, 200], [167, 200], 2.0],
      [[497, 327], [528, 327], 2.0], [[497, 357], [528, 357], 2.0], [[528, 327], [528, 334], 2.0], [[528, 350], [528, 357], 2.0],
    ];
    P.RAILS = [[[111, 371], [180, 371]], [[187, 414], [805, 414]], [[805, 399], [980, 399]], [[980, 373], [1101, 373]], [[773, 106], [822, 106]], [[1020, 238], [1101, 238]], [[1101, 238], [1101, 373]], [[805, 174], [818, 174]]];
    P.LIGHTS = [[230, 305, 9], [298, 300, 8], [345, 300, 7], [150, 305, 6], [215, 200, 6], [420, 315, 6], [610, 340, 9], [520, 345, 6],
      [700, 310, 6], [900, 195, 8], [560, 250, 5], [460, 212, 5]];
  }

  // ------------------------------------------------------------------ seeded random
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  function build(T, ext, kind) {
    const S = SPEC[kind];
    [OX, OY, SX, SZ] = S.frame;
    const { WALLS, FLOORS, SILLS = {}, FILL = {}, DOORS = [], POOL, GLAZING = [], PARTITIONS = [], RAILS = [] } = S;
    const RB = ext.RoundedBoxGeometry;
    const root = new T.Group();
    root.name = 'Unit_' + kind;
    seed = 7;

    // ---------------------------------------------------------------- finishes (procedural textures, no image loads)
    function canvasTex(px, metres, draw) {
      const c = document.createElement('canvas');
      c.width = c.height = px;
      draw(c.getContext('2d'), px);
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(1 / metres, 1 / metres);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    }
    const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
    function boards(g, n, w, plank, hue, sat, light, gap) {
      const rowH = n / Math.round(n / plank);
      for (let y = 0; y < n; y += rowH) {
        let x = -rnd() * n * 0.5;
        while (x < n) {
          const len = n * (0.35 + rnd() * 0.5);
          g.fillStyle = hsl(hue + rnd() * 6 - 3, sat + rnd() * 8 - 4, light + rnd() * 8 - 4);
          g.fillRect(x, y, len, rowH);
          g.globalAlpha = 0.08;
          for (let k = 0; k < 7; k++) {
            g.strokeStyle = rnd() > 0.5 ? '#2a1a0c' : '#fff3e0';
            g.lineWidth = 0.6 + rnd() * 1.4;
            const yy = y + rnd() * rowH;
            g.beginPath(); g.moveTo(x, yy);
            g.bezierCurveTo(x + len * 0.3, yy + rnd() * 4 - 2, x + len * 0.6, yy + rnd() * 4 - 2, x + len, yy + rnd() * 3 - 1.5);
            g.stroke();
          }
          g.globalAlpha = 1;
          g.fillStyle = gap;
          g.fillRect(x, y, 1.2, rowH);
          if (x + len > n) { g.fillStyle = g.fillStyle; }
          x += len;
        }
        g.fillStyle = gap;
        g.fillRect(0, y, n, 1.2);
      }
      // wrap: copy the wrapped row parts so tiling is seamless enough at viewing distance
    }
    function stoneTiles(g, n, tiles, base, veins, grout, veinCount) {
      g.fillStyle = base; g.fillRect(0, 0, n, n);
      const img = g.getImageData(0, 0, n, n);
      for (let i = 0; i < img.data.length; i += 4) { const v = (rnd() - 0.5) * 10; img.data[i] += v; img.data[i + 1] += v; img.data[i + 2] += v; }
      g.putImageData(img, 0, 0);
      for (let k = 0; k < veinCount; k++) {
        g.strokeStyle = veins; g.globalAlpha = 0.08 + rnd() * 0.16; g.lineWidth = 0.6 + rnd() * 1.8;
        let x = rnd() * n, y = rnd() * n;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 6; s++) { const nx = x + (rnd() - 0.3) * n * 0.3, ny = y + (rnd() - 0.5) * n * 0.18; g.quadraticCurveTo((x + nx) / 2 + (rnd() - 0.5) * 30, (y + ny) / 2 + (rnd() - 0.5) * 30, nx, ny); x = nx; y = ny; }
        g.stroke();
      }
      g.globalAlpha = 1; g.fillStyle = grout;
      const step = n / tiles;
      for (let i = 0; i <= tiles; i++) { g.fillRect(i * step - 0.7, 0, 1.4, n); g.fillRect(0, i * step - 0.7, n, 1.4); }
    }
    const TEX = {
      oak: canvasTex(1024, 2.4, (g, n) => boards(g, n, n, n / 12, 30, 32, 50, 'rgba(60,42,26,.4)')),
      deck: canvasTex(1024, 2.4, (g, n) => boards(g, n, n, n / 17, 26, 30, 34, 'rgba(25,16,10,.6)')),
      marble: canvasTex(1024, 1.8, (g, n) => stoneTiles(g, n, 2, '#d9ccb8', '#a8957c', 'rgba(140,124,104,.34)', 22)),
      bath: canvasTex(1024, 1.2, (g, n) => stoneTiles(g, n, 2, '#e4ddd2', '#a09282', 'rgba(150,138,124,.38)', 26)),
      stone: canvasTex(512, 1.2, (g, n) => stoneTiles(g, n, 2, '#bdb7ad', '#8b857b', 'rgba(90,85,78,.6)', 6)),
      plaster: canvasTex(256, 1, (g, n) => {
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
        const img = g.getImageData(0, 0, n, n);
        for (let i = 0; i < img.data.length; i += 4) { const v = 244 + rnd() * 11; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; }
        g.putImageData(img, 0, 0);
      }),
      water: canvasTex(512, 3, (g, n) => {
        const gr = g.createLinearGradient(0, 0, n, n); gr.addColorStop(0, '#5fc2d8'); gr.addColorStop(1, '#3a9fbd');
        g.fillStyle = gr; g.fillRect(0, 0, n, n);
        g.strokeStyle = 'rgba(255,255,255,.28)';
        for (let k = 0; k < 90; k++) { g.lineWidth = 0.5 + rnd() * 1.6; const x = rnd() * n, y = rnd() * n; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 20, y - 12 * rnd(), x + 30, y + 14 * rnd(), x + 46 * rnd() + 10, y + 6); g.stroke(); }
      }),
    };
    const std = (color, roughness, extra = {}) => new T.MeshStandardMaterial({ color, roughness, metalness: 0, envMapIntensity: 0.32, ...extra });
    const M = {
      oakFloor: std(0xffffff, 0.62, { map: TEX.oak }),
      marble: std(0xffffff, 0.55, { map: TEX.marble, envMapIntensity: 0.2 }),
      bath: std(0xffffff, 0.45, { map: TEX.bath, envMapIntensity: 0.22 }),
      stone: std(0xffffff, 0.85, { map: TEX.stone }),
      deck: std(0xffffff, 0.7, { map: TEX.deck }),
      lift: std(0x8a8279, 0.45, { metalness: 0.3 }),
      water: std(0xffffff, 0.25, { map: TEX.water, envMapIntensity: 0.06, emissive: 0x0f5a6e, emissiveIntensity: 0.25 }),
      poolTile: std(0x9fd3df, 0.3),
      waterShallow: std(0xd6f2f6, 0.25, { map: TEX.water, envMapIntensity: 0.06, emissive: 0x2c8aa0, emissiveIntensity: 0.15, transparent: true, opacity: 0.92 }),
      coping: std(0xe2ddd3, 0.6),
      slab: std(0xe6dfd2, 0.92),
      wall: std(0xebe2d3, 0.94, { map: TEX.plaster }),
      cap: std(0x4a443d, 0.9),
      fabric: std(0xd6cdc0, 1), fabricLight: std(0xe6dfd4, 1), fabricDark: std(0x8f857a, 1),
      boucle: std(0xefe9df, 1), sage: std(0x9a9d88, 1), rust: std(0x94806a, 1), navy: std(0x77705f, 1),
      linen: std(0xf6f3ee, 0.95), duvet: std(0xece5da, 1), head: std(0xbcb1a3, 1),
      oak: std(0xa98058, 0.6), oakDark: std(0x5c4332, 0.6), walnut: std(0x6e4e37, 0.55),
      stoneTop: std(0xebe7e0, 0.3), darkStone: std(0x3c3936, 0.35),
      ceramic: std(0xfbfaf8, 0.18), metal: std(0x4a3b2d, 0.35, { metalness: 0.75 }), steel: std(0xb9b8b4, 0.3, { metalness: 0.8 }),
      black: std(0x151310, 0.25), sinkIn: std(0x7d7c78, 0.35, { metalness: 0.7 }), hobRing: std(0x55524e, 0.5), mirror: std(0xcfd6da, 0.05, { metalness: 0.95 }),
      glass: new T.MeshPhysicalMaterial({ color: 0xe6f0f2, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.13, envMapIntensity: 1.4, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }),
      frame: std(0x8a7252, 0.36, { metalness: 0.8, envMapIntensity: 1 }),
      shade: std(0xf6ead8, 0.9, { emissive: 0xffd6a4, emissiveIntensity: 0.45 }),
      bulb: std(0xfff1dc, 0.4, { emissive: 0xffdcae, emissiveIntensity: 0.7 }),
      leaf: std(0x4d6a3a, 0.75), leafLight: std(0x6d8a4b, 0.75), leafPale: std(0x8aa562, 0.75), soil: std(0x3b2f26, 1), bark: std(0x6b5644, 0.9),
      garden: std(0x566540, 1), pot: std(0xcfc6b8, 0.55), rug: std(0xd3c8b8, 1), rug2: std(0xbfb2a0, 1), appliance: std(0xf2f1ee, 0.35),
    };

    // ---------------------------------------------------------------- primitives
    const geoCache = {};
    function rbox(w, h, d, r) {
      r = Math.max(0, Math.min(r || 0, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
      const k = [w, h, d, r].map((v) => v.toFixed(3)).join();
      if (!geoCache[k]) geoCache[k] = r > 0.004 ? new RB(w, h, d, 3, r) : new T.BoxGeometry(w, h, d);
      return geoCache[k];
    }
    function add(parent, geo, mat, x, y, z, cast = true) {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = cast; m.receiveShadow = true;
      parent.add(m);
      return m;
    }
    // box spanning ranges (local units, metres)
    const bx = (g, x0, x1, y0, y1, z0, z1, mat, r = 0) => add(g, rbox(x1 - x0, y1 - y0, z1 - z0, r), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const cyl = (g, r0, r1, h, x, y, z, mat, seg = 28) => add(g, new T.CylinderGeometry(r0, r1, h, seg), mat, x, y + h / 2, z);
    // place a local-frame builder over a plan rectangle; `back` is the side that sits against the wall
    function orient(rect, back, fn) {
      const x0 = X(rect[0]), z0 = Z(rect[1]), x1 = X(rect[2]), z1 = Z(rect[3]);
      const along = back === 'W' || back === 'E';
      const L = along ? x1 - x0 : z1 - z0, W = along ? z1 - z0 : x1 - x0;
      const g = new T.Group();
      fn(g, L, W);
      g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
      g.rotation.y = { W: 0, E: Math.PI, N: -Math.PI / 2, S: Math.PI / 2 }[back];
      root.add(g);
      return g;
    }
    // a straight run between two plan points, built along local x
    function run(p0, p1, fn) {
      const x0 = X(p0[0]), z0 = Z(p0[1]), x1 = X(p1[0]), z1 = Z(p1[1]);
      const len = Math.hypot(x1 - x0, z1 - z0);
      const g = new T.Group();
      fn(g, len);
      g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
      g.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      root.add(g);
    }

    // ---------------------------------------------------------------- shell: slab, floors, walls, glazing
    const slab = new T.Group(); root.add(slab);
    Object.values(FLOORS).flat().forEach(([a, b, c, d]) => {
      const m = add(slab, new T.BoxGeometry(X(c) - X(a), 0.45, Z(d) - Z(b)), M.slab, (X(a) + X(c)) / 2, -0.225 - 0.002, (Z(b) + Z(d)) / 2, false);
      m.receiveShadow = false;
    });
    function floorRect([a, b, c, d], mat, y = 0.004) {
      const x0 = X(a), z0 = Z(b), x1 = X(c), z1 = Z(d);
      const g = new T.PlaneGeometry(x1 - x0, z1 - z0);
      g.rotateX(-Math.PI / 2);
      g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
      const p = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), -p.getZ(i));
      add(root, g, mat, 0, 0, 0, false);
    }
    const FMAT = { oak: M.oakFloor, marble: M.marble, bath: M.bath, stone: M.stone, lift: M.lift, deck: M.deck, garden: M.garden };
    Object.entries(FLOORS).forEach(([k, list]) => list.forEach((r) => floorRect(r, FMAT[k])));
    Object.entries(FILL).forEach(([k, list]) => list.forEach((r) => {
      floorRect(r, FMAT[k], 0.008);
      add(slab, new T.BoxGeometry(X(r[2]) - X(r[0]), 0.45, Z(r[3]) - Z(r[1])), M.slab, (X(r[0]) + X(r[2])) / 2, -0.228, (Z(r[1]) + Z(r[3])) / 2, false);
    }));
    // closed front doors on the unit's entrance (the common corridor beyond is not modelled)
    DOORS.forEach(([a, b, c, d]) => {
      const x0 = X(a), z0 = Z(b), x1 = X(c), z1 = Z(d);
      bx(root, x0, x1, 0, 2.4, z0, z1, M.walnut, 0.01);
      bx(root, x0 - 0.03, x1 + 0.03, 2.4, H, z0, z1, M.wall);
      const along = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (along) bx(root, cx - 0.01, cx + 0.01, 0.9, 1.5, z0 - 0.04, z1 + 0.04, M.metal);
      else bx(root, x0 - 0.04, x1 + 0.04, 0.9, 1.5, cz - 0.01, cz + 0.01, M.metal);
    });
    Object.entries(SILLS).forEach(([k, list]) => list.forEach((r) => {
      floorRect(r, FMAT[k], 0.012);
      add(slab, new T.BoxGeometry(X(r[2]) - X(r[0]), 0.45, Z(r[3]) - Z(r[1])), M.slab, (X(r[0]) + X(r[2])) / 2, -0.227, (Z(r[1]) + Z(r[3])) / 2, false);
    }));
    // pool: recessed basin, water a little below the deck, stone coping
    // pools: water a little below the deck; coping and tiled sides only on edges that don't meet another pool area
    const pools = !POOL ? [] : Array.isArray(POOL[0]) ? POOL : [POOL];
    const inPool = (px, py, self) => pools.some((q) => q !== self && px > q[0] && px < q[2] && py > q[1] && py < q[3]);
    pools.forEach((P) => {
      const x0 = X(P[0]), z0 = Z(P[1]), x1 = X(P[2]), z1 = Z(P[3]);
      const shallow = P[4] === 1;
      floorRect(P, shallow ? M.waterShallow : M.water, shallow ? -0.07 : -0.12);
      bx(root, x0, x1, -0.45, -0.3, z0, z1, M.slab);
      const mx = (P[0] + P[2]) / 2, my = (P[1] + P[3]) / 2, t = 0.12;
      const edges = [
        [!inPool(mx, P[1] - 3, P), [x0, x1, z0 - t, z0], [x0, x1, z0, z0 + 0.02]],
        [!inPool(mx, P[3] + 3, P), [x0, x1, z1, z1 + t * 0.6], [x0, x1, z1 - 0.02, z1]],
        [!inPool(P[0] - 3, my, P), [x0 - t, x0, z0, z1], [x0, x0 + 0.02, z0, z1]],
        [!inPool(P[2] + 3, my, P), [x1, x1 + t, z0, z1], [x1 - 0.02, x1, z0, z1]],
      ];
      edges.forEach(([open, c, w]) => {
        if (!open) return;
        bx(root, c[0], c[1], -0.02, 0.03, c[2], c[3], M.coping, 0.01);
        bx(root, w[0], w[1], -0.3, 0.0, w[2], w[3], M.poolTile);
      });
    });
    // walls: white faces, a dark poché on the cut top so the plan reads like the drawing
    (window.DEFINE_HAND_CAPS = window.DEFINE_HAND_CAPS || []).push(M.cap);
    const wallMats = [M.wall, M.wall, M.cap, M.wall, M.wall, M.wall];
    WALLS.forEach(([a, b, c, d]) => {
      const m = new T.Mesh(new T.BoxGeometry(X(c) - X(a), H, Z(d) - Z(b)), wallMats);
      m.position.set((X(a) + X(c)) / 2, H / 2, (Z(b) + Z(d)) / 2);
      m.castShadow = m.receiveShadow = true;
      root.add(m);
    });
    {
      const pos = [], col = [], idx = [], R = 0.55, A = 0.34;
      WALLS.forEach(([a, b, c, d]) => {
        const x0 = X(a), z0 = Z(b), x1 = X(c), z1 = Z(d), o = pos.length / 3;
        [[x0, z0, A], [x1, z0, A], [x1, z1, A], [x0, z1, A], [x0 - R, z0 - R, 0], [x1 + R, z0 - R, 0], [x1 + R, z1 + R, 0], [x0 - R, z1 + R, 0]]
          .forEach(([x, z, al]) => { pos.push(x, 0.02, z); col.push(0.02, 0.015, 0.01, al); });
        for (let k = 0; k < 4; k++) { const n = (k + 1) % 4; idx.push(o + k, o + 4 + k, o + 4 + n, o + k, o + 4 + n, o + n); }
      });
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(col, 4));
      g.setIndex(idx);
      const m = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: T.DoubleSide }));
      m.renderOrder = 1;
      root.add(m);
    }
    // glazing: framed floor-to-ceiling panes
    GLAZING.forEach(([p0, p1]) => run(p0, p1, (g, len) => {
      const n = Math.max(1, Math.round(len / 1.4));
      add(g, new T.BoxGeometry(len, H - 0.08, 0.02), M.glass, 0, H / 2, 0, false);
      bx(g, -len / 2, len / 2, 0, 0.03, -0.03, 0.03, M.frame);
      bx(g, -len / 2, len / 2, H - 0.035, H, -0.03, 0.03, M.frame);
      for (let i = 0; i <= n; i++) { const x = -len / 2 + (len * i) / n; bx(g, x - 0.014, x + 0.014, 0, H, -0.03, 0.03, M.frame); }
    }));
    PARTITIONS.forEach(([p0, p1, h]) => run(p0, p1, (g, len) => {
      add(g, new T.BoxGeometry(len, h, 0.012), M.glass, 0, h / 2, 0, false);
      bx(g, -len / 2, len / 2, h - 0.02, h, -0.012, 0.012, M.frame);
    }));
    // frameless glass balustrades with a slim bronze cap rail
    RAILS.forEach(([p0, p1]) => run(p0, p1, (g, len) => {
      add(g, new T.BoxGeometry(len, 1.0, 0.02), M.glass, 0, 0.55, 0, false);
      bx(g, -len / 2, len / 2, 0, 0.06, -0.035, 0.035, M.frame);
      bx(g, -len / 2, len / 2, 1.05, 1.09, -0.025, 0.025, M.frame);
    }));

    // ---------------------------------------------------------------- furniture library (local frame: back at −L/2)
    function bed(g, L, W) {
      bx(g, -L / 2, -L / 2 + 0.09, 0, 1.15, -W / 2 - 0.06, W / 2 + 0.06, M.head, 0.035);
      bx(g, -L / 2 + 0.09, L / 2, 0.06, 0.3, -W / 2, W / 2, M.oakDark, 0.02);
      bx(g, -L / 2 + 0.11, L / 2 - 0.02, 0.3, 0.52, -W / 2 + 0.02, W / 2 - 0.02, M.linen, 0.06);
      bx(g, -L / 2 + 0.62, L / 2 + 0.02, 0.36, 0.585, -W / 2 - 0.02, W / 2 + 0.02, M.duvet, 0.05);
      bx(g, L / 2 - 0.62, L / 2 - 0.18, 0.585, 0.61, -W / 2 - 0.03, W / 2 + 0.03, M.rust, 0.01);
      const n = W > 1.3 ? 2 : 1, pw = (W - 0.2) / n;
      for (let i = 0; i < n; i++) {
        const z = -W / 2 + 0.1 + pw * (i + 0.5);
        const p = bx(g, -L / 2 + 0.13, -L / 2 + 0.5, 0.5, 0.7, z - pw / 2 + 0.04, z + pw / 2 - 0.04, M.linen, 0.08);
        p.rotation.z = -0.32;
      }
      if (W > 1.3) {
        const c = bx(g, -L / 2 + 0.45, -L / 2 + 0.62, 0.55, 0.85, -0.28, 0.28, M.sage, 0.07);
        c.rotation.z = -0.28;
      }
    }
    function nightstand(g, L, W) {
      bx(g, -L / 2, L / 2, 0.08, 0.52, -W / 2, W / 2, M.walnut, 0.02);
      bx(g, L / 2 - 0.005, L / 2 + 0.002, 0.3, 0.32, -W / 4, W / 4, M.metal);
      cyl(g, 0.06, 0.08, 0.22, 0, 0.52, 0, M.ceramic, 18);
      cyl(g, 0.006, 0.006, 0.1, 0, 0.74, 0, M.metal, 6);
      cyl(g, 0.12, 0.16, 0.2, 0, 0.8, 0, M.shade, 24);
    }
    function sofa(g, L, W, seats) {
      const arm = 0.2;
      bx(g, -L / 2 + 0.02, L / 2 - 0.02, 0.04, 0.24, -W / 2 + 0.02, W / 2 - 0.02, M.fabricDark, 0.04);
      bx(g, -L / 2, L / 2, 0.04, 0.62, -W / 2, -W / 2 + arm, M.fabric, 0.07);
      bx(g, -L / 2, L / 2, 0.04, 0.62, W / 2 - arm, W / 2, M.fabric, 0.07);
      bx(g, -L / 2, -L / 2 + 0.22, 0.04, 0.72, -W / 2 + arm, W / 2 - arm, M.fabric, 0.06);
      const n = seats || Math.max(1, Math.round((W - 2 * arm) / 0.78)), sw = (W - 2 * arm) / n;
      for (let i = 0; i < n; i++) {
        const z0 = -W / 2 + arm + sw * i;
        bx(g, -L / 2 + 0.2, L / 2 - 0.01, 0.24, 0.45, z0 + 0.008, z0 + sw - 0.008, M.fabricLight, 0.07);
        const b = bx(g, -L / 2 + 0.16, -L / 2 + 0.38, 0.45, 0.88, z0 + 0.01, z0 + sw - 0.01, M.fabricLight, 0.09);
        b.rotation.z = -0.12;
      }
      if (W > 1.6) {
        [[-W / 2 + arm + 0.28, M.rust], [W / 2 - arm - 0.28, M.sage]].forEach(([z, m]) => {
          const p = bx(g, -L / 2 + 0.36, -L / 2 + 0.52, 0.45, 0.85, z - 0.22, z + 0.22, m, 0.07);
          p.rotation.z = -0.2;
        });
      }
    }
    const armchair = (g, L, W) => {
      // rounded bouclé lounge chair
      bx(g, -L / 2, L / 2, 0.06, 0.4, -W / 2, W / 2, M.boucle, 0.12);
      bx(g, -L / 2, -L / 2 + 0.22, 0.3, 0.78, -W / 2, W / 2, M.boucle, 0.1);
      bx(g, -L / 2 + 0.2, L / 2 - 0.02, 0.4, 0.5, -W / 2 + 0.08, W / 2 - 0.08, M.boucle, 0.05);
      bx(g, -L / 2, L / 2 - 0.1, 0.3, 0.62, -W / 2, -W / 2 + 0.1, M.boucle, 0.05);
      bx(g, -L / 2, L / 2 - 0.1, 0.3, 0.62, W / 2 - 0.1, W / 2, M.boucle, 0.05);
    };
    function table(g, L, W, h, top, leg) {
      bx(g, -L / 2, L / 2, h - 0.04, h, -W / 2, W / 2, top, 0.01);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => bx(g, a * (L / 2 - 0.1) - 0.03, a * (L / 2 - 0.1) + 0.03, 0, h - 0.04, b * (W / 2 - 0.1) - 0.03, b * (W / 2 - 0.1) + 0.03, leg));
    }
    function chair(g, L, W) {
      bx(g, -L / 2 + 0.04, L / 2, 0.44, 0.5, -W / 2, W / 2, M.fabric, 0.03);
      bx(g, -L / 2, -L / 2 + 0.06, 0.48, 0.9, -W / 2 + 0.02, W / 2 - 0.02, M.fabric, 0.03);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => bx(g, a * (L / 2 - 0.05) - 0.015, a * (L / 2 - 0.05) + 0.015, 0, 0.44, b * (W / 2 - 0.05) - 0.015, b * (W / 2 - 0.05) + 0.015, M.oakDark));
    }
    function stool(x, z) {
      const g = new T.Group(); g.position.set(X(x), 0, Z(z)); root.add(g);
      cyl(g, 0.18, 0.18, 0.06, 0, 0.66, 0, M.fabricDark);
      cyl(g, 0.02, 0.02, 0.66, 0, 0, 0, M.metal, 8);
      cyl(g, 0.17, 0.17, 0.015, 0, 0, 0, M.metal);
    }
    function media(g, L, W) {
      bx(g, -L / 2, L / 2, 0.12, 0.5, -W / 2, W / 2, M.walnut, 0.015);
      const tw = Math.min(W * 0.8, 1.65);
      bx(g, -L / 2 - 0.02, -L / 2 + 0.03, 1.0, 1.0 + tw * 0.56, -tw / 2, tw / 2, M.black, 0.01);
      if (W > 1.5) { cyl(g, 0.07, 0.09, 0.28, 0, 0.5, W / 2 - 0.25, M.ceramic, 16); }
    }
    function wardrobe(g, L, W, h = 2.35) {
      const n = Math.max(1, Math.round(W / 0.55)), dw = W / n;
      for (let i = 0; i < n; i++) {
        const z0 = -W / 2 + dw * i;
        bx(g, -L / 2, L / 2, 0.02, h, z0 + 0.004, z0 + dw - 0.004, M.oak, 0.006);
        const hz = i % 2 ? z0 + 0.06 : z0 + dw - 0.06;
        bx(g, L / 2, L / 2 + 0.02, 0.85, 1.45, hz - 0.008, hz + 0.008, M.metal);
      }
    }
    function counter(g, L, W, opts = {}) {
      // base run: drawer fronts with shadow gaps rather than one block
      const nb = Math.max(1, Math.round(W / 0.6)), bw = W / nb;
      for (let i = 0; i < nb; i++) {
        const z0 = -W / 2 + bw * i;
        bx(g, -L / 2, L / 2 - 0.02, 0.1, 0.48, z0 + 0.003, z0 + bw - 0.003, opts.base || M.oak, 0.006);
        bx(g, -L / 2, L / 2 - 0.02, 0.485, 0.875, z0 + 0.003, z0 + bw - 0.003, opts.base || M.oak, 0.006);
      }
      bx(g, -L / 2, L / 2, 0, 0.1, -W / 2 + 0.02, W / 2 - 0.02, M.oakDark);
      bx(g, -L / 2, L / 2 + (opts.over || 0.02), 0.88, 0.92, -W / 2, W / 2, opts.top || M.stoneTop, 0.008);
      const top = 0.92;
      (opts.sinks || []).forEach((z) => {
        // undermount sink: brushed rim, darker basin, gooseneck tap behind it
        bx(g, -0.24, 0.24, top, top + 0.003, z - 0.32, z + 0.32, M.steel, 0.01);
        bx(g, -0.2, 0.2, top + 0.003, top + 0.005, z - 0.28, z + 0.28, M.sinkIn, 0.01);
        const fx = Math.max(-0.3, -L / 2 + 0.05);
        cyl(g, 0.016, 0.02, 0.34, fx, top, z, M.steel, 12);
        bx(g, fx, fx + 0.18, top + 0.32, top + 0.345, z - 0.012, z + 0.012, M.steel, 0.008);
      });
      (opts.hobs || []).forEach((z) => {
        // flush induction hob: black glass with four faint zones
        bx(g, -0.25, 0.25, top, top + 0.006, z - 0.3, z + 0.3, M.black, 0.006);
        [[-0.11, -0.15], [-0.11, 0.15], [0.11, -0.15], [0.11, 0.15]].forEach(([a, b]) => {
          const r = add(g, new T.TorusGeometry(a < 0 ? 0.08 : 0.065, 0.004, 4, 32), M.hobRing, a, top + 0.008, z + b, false);
          r.rotation.x = Math.PI / 2;
        });
      });
      if (opts.uppers) bx(g, -L / 2, -L / 2 + 0.36, 1.5, 2.25, -W / 2, W / 2, M.oak, 0.01);
    }
    function vanity(g, L, W, basins) {
      bx(g, -L / 2, L / 2, 0.32, 0.78, -W / 2, W / 2, M.walnut, 0.012);
      bx(g, -L / 2, L / 2 + 0.01, 0.78, 0.82, -W / 2, W / 2, M.stoneTop, 0.008);
      basins.forEach((z) => {
        const s = add(g, new T.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.ceramic, 0.02, 0.82, z);
        s.scale.set(0.95, 0.55, 1.15);
        cyl(g, 0.012, 0.012, 0.3, -L / 2 + 0.06, 0.82, z, M.metal, 8);
        bx(g, -L / 2 - 0.01, -L / 2 + 0.015, 1.05, 1.95, z - 0.36, z + 0.36, M.mirror, 0.01);
      });
    }
    function wc(g, L, W) {
      bx(g, -L / 2, -L / 2 + 0.14, 0, 1.05, -0.26, 0.26, M.stoneTop, 0.01);
      bx(g, -L / 2 + 0.12, -L / 2 + 0.68, 0.22, 0.42, -0.18, 0.18, M.ceramic, 0.12);
      bx(g, -L / 2 + 0.14, -L / 2 + 0.7, 0.42, 0.45, -0.185, 0.185, M.ceramic, 0.05);
    }
    function tubRect(g, L, W) {
      const t = 0.08;
      bx(g, -L / 2, L / 2, 0, 0.56, -W / 2, -W / 2 + t, M.ceramic, 0.02);
      bx(g, -L / 2, L / 2, 0, 0.56, W / 2 - t, W / 2, M.ceramic, 0.02);
      bx(g, -L / 2, -L / 2 + t, 0, 0.56, -W / 2, W / 2, M.ceramic, 0.02);
      bx(g, L / 2 - t, L / 2, 0, 0.56, -W / 2, W / 2, M.ceramic, 0.02);
      bx(g, -L / 2 + t, L / 2 - t, 0, 0.42, -W / 2 + t, W / 2 - t, M.ceramic);
      bx(g, -L / 2 + t, L / 2 - t, 0.42, 0.44, -W / 2 + t, W / 2 - t, M.water);
    }
    function tubRound(x, z, r) {
      const pts = [[0, 0.1], [r - 0.12, 0.12], [r - 0.07, 0.3], [r - 0.06, 0.56], [r - 0.02, 0.6], [r, 0.56], [r - 0.01, 0.2], [r - 0.08, 0.02], [0, 0]]
        .map(([a, b]) => new T.Vector2(a, b));
      const g = new T.Group(); g.position.set(X(x), 0, Z(z)); root.add(g);
      add(g, new T.LatheGeometry(pts, 48), M.ceramic, 0, 0, 0);
      const w = add(g, new T.CircleGeometry(r - 0.1, 40), M.water, 0, 0.46, 0, false);
      w.rotation.x = -Math.PI / 2;
      cyl(g, 0.015, 0.015, 0.95, r + 0.15, 0, 0, M.metal, 8);
    }
    function lounger(g, L, W) {
      bx(g, -L / 2, L / 2, 0.1, 0.26, -W / 2, W / 2, M.walnut, 0.02);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => bx(g, a * (L / 2 - 0.06) - 0.025, a * (L / 2 - 0.06) + 0.025, 0, 0.1, b * (W / 2 - 0.05) - 0.025, b * (W / 2 - 0.05) + 0.025, M.walnut));
      bx(g, -L / 2 + 0.62, L / 2 - 0.02, 0.26, 0.34, -W / 2 + 0.02, W / 2 - 0.02, M.linen, 0.035);
      const back = new T.Group(); back.position.set(-L / 2 + 0.64, 0.3, 0); back.rotation.z = -0.62; g.add(back);
      bx(back, -0.68, 0, -0.04, 0.05, -W / 2 + 0.02, W / 2 - 0.02, M.linen, 0.035);
      const t = bx(g, L / 2 - 0.5, L / 2 - 0.1, 0.34, 0.36, -W / 2 + 0.01, W / 2 - 0.01, M.navy, 0.008);
    }
    function round(x, z, r, h, top, base) {
      const g = new T.Group(); g.position.set(X(x), 0, Z(z)); root.add(g);
      cyl(g, r, r, 0.035, 0, h - 0.035, 0, top, 32);
      cyl(g, r * 0.3, r * 0.45, h - 0.035, 0, 0, 0, base, 20);
    }
    // foliage: arching leaf blades and dense small-leaf canopies in three greens (no blobs)
    const LEAVES = () => [M.leaf, M.leafLight, M.leafPale];
    const bladeGeo = (() => { const g = new T.SphereGeometry(1, 10, 8); g.translate(0, 1, 0); return g; })();
    const puffGeo = new T.IcosahedronGeometry(1, 2);
    function blades(g, n, len, y, spread) {
      const L = LEAVES();
      for (let k = 0; k < n; k++) {
        const m = new T.Mesh(bladeGeo, L[k % 3]);
        const l = len * (0.6 + rnd() * 0.5);
        m.scale.set(0.055 * len / 0.5 + rnd() * 0.02, l / 2, 0.012);
        m.position.set((rnd() - 0.5) * spread, y, (rnd() - 0.5) * spread);
        m.rotation.set(0.25 + rnd() * 0.85, (k / n) * Math.PI * 2 + rnd() * 0.5, 0, 'YXZ');
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
    }
    function canopy(g, n, rx, ry, cy, r0, r1) {
      const L = LEAVES();
      for (let k = 0; k < n; k++) {
        const a = rnd() * Math.PI * 2, e = Math.acos(2 * rnd() - 1), d = 0.55 + rnd() * 0.45;
        const m = new T.Mesh(puffGeo, L[k % 3]);
        const r = r0 + rnd() * (r1 - r0);
        m.scale.set(r, r * 0.8, r);
        m.position.set(Math.sin(e) * Math.cos(a) * rx * d, cy + Math.cos(e) * ry * d, Math.sin(e) * Math.sin(a) * rx * d);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
    }
    function plant(x, z, s = 1) {
      const g = new T.Group(); g.position.set(X(x), 0, Z(z)); root.add(g);
      const pts = [[0, 0], [0.13, 0], [0.19, 0.12], [0.2, 0.36], [0.185, 0.4], [0.165, 0.38], [0, 0.38]].map(([a, b]) => new T.Vector2(a * s, b * s));
      add(g, new T.LatheGeometry(pts, 28), M.pot, 0, 0, 0);
      cyl(g, 0.16 * s, 0.16 * s, 0.01, 0, 0.37 * s, 0, M.soil, 20);
      blades(g, 20, 0.62 * s, 0.37 * s, 0.1 * s);
    }
    function rug(rect, mat) {
      const m = add(root, rbox(X(rect[2]) - X(rect[0]), 0.012, Z(rect[3]) - Z(rect[1]), 0.004), mat, (X(rect[0]) + X(rect[2])) / 2, 0.012, (Z(rect[1]) + Z(rect[3])) / 2, false);
      m.receiveShadow = true;
    }
    function pendants(x0, x1, z, n, y = 1.75) {
      for (let i = 0; i < n; i++) {
        const x = X(x0) + ((X(x1) - X(x0)) * (i + 0.5)) / n;
        add(root, new T.SphereGeometry(0.13, 20, 14), M.bulb, x, y, Z(z), false);
        cyl(root, 0.004, 0.004, H - y - 0.1, x, y + 0.1, Z(z), M.metal, 4);
      }
    }
    function pendantsZ(x, z0, z1, n, y = 1.75) {
      for (let i = 0; i < n; i++) {
        const z = Z(z0) + ((Z(z1) - Z(z0)) * (i + 0.5)) / n;
        add(root, new T.SphereGeometry(0.12, 20, 14), M.bulb, X(x), y, z, false);
        cyl(root, 0.004, 0.004, H - y - 0.1, X(x), y + 0.1, z, M.metal, 4);
      }
    }

    function furnishJardin() {
      // living / dining / gallery kitchen
      rug([578, 715, 662, 810], M.rug);
      orient([565, 722, 597, 802], 'W', (g, L, W) => sofa(g, L, W, 3));
      orient([612, 693, 642, 722], 'N', armchair);
      orient([612, 800, 642, 829], 'S', armchair);
      orient([615, 742, 643, 782], 'W', (g, L, W) => table(g, L, W, 0.36, M.stoneTop, M.oakDark));
      orient([690, 715, 707, 797], 'E', media);
      round(585, 712, 0.22, 0.5, M.walnut, M.walnut);
      plant(690, 830, 1.0);
      orient([482, 705, 520, 820], 'N', (g, L, W) => table(g, L, W, 0.75, M.oak, M.oakDark));
      [717, 742, 767, 792].forEach((y) => { orient([466, y, 482, y + 18], 'W', chair); orient([520, y, 536, y + 18], 'E', chair); });
      pendantsZ(501, 712, 812, 3);
      orient([385, 717, 433, 812], 'W', (g, L, W) => counter(g, L, W, { sinks: [0.8], hobs: [-0.35], over: 0.25, base: M.walnut }));
      stool(442, 735); stool(442, 760); stool(442, 785);
      pendantsZ(409, 722, 806, 2, 1.85);
      orient([325, 700, 349, 842], 'W', (g, L, W) => {
        const col = 0.62, z0 = -W / 2 + col, z1 = W / 2 - col;
        [[-W / 2, z0], [z1, W / 2]].forEach(([a, b], i) => {
          bx(g, -L / 2, L / 2, 0.02, 2.4, a + 0.004, (a + b) / 2 - 0.003, M.oak, 0.006);
          bx(g, -L / 2, L / 2, 0.02, 2.4, (a + b) / 2 + 0.003, b - 0.004, M.oak, 0.006);
          if (i === 0) { bx(g, L / 2 - 0.02, L / 2 + 0.005, 0.85, 1.45, a + 0.05, b - 0.05, M.black, 0.01); bx(g, L / 2 - 0.02, L / 2 + 0.005, 1.5, 1.95, a + 0.05, b - 0.05, M.black, 0.01); }
        });
        const run = new T.Group(); g.add(run); run.position.z = (z0 + z1) / 2;
        counter(run, L, z1 - z0, {});
        bx(g, -L / 2, -L / 2 + 0.02, 0.92, 1.5, z0, z1, M.stoneTop);
        bx(g, -L / 2, -L / 2 + 0.36, 1.5, 2.4, z0 + 0.003, z1 - 0.003, M.oak, 0.006);
        bx(g, -L / 2 + 0.3, -L / 2 + 0.34, 1.485, 1.5, z0 + 0.05, z1 - 0.05, M.bulb);
      });
      // wet kitchen, yard, storage, AC ledge
      orient([497, 528, 592, 548], 'N', (g, L, W) => counter(g, L, W, { sinks: [-(X(530) - X(544))], uppers: true }));
      orient([572, 548, 592, 640], 'E', (g, L, W) => counter(g, L, W, { hobs: [0.4] }));
      orient([500, 610, 522, 640], 'W', (g, L, W) => { bx(g, -L / 2, L / 2, 0.02, 1.9, -W / 2, W / 2, M.steel, 0.02); });
      orient([421, 543, 442, 590], 'W', (g, L, W) => {
        bx(g, -L / 2, L / 2, 0, 0.86, -W / 2, -W / 2 + 0.6, M.appliance, 0.02);
        bx(g, -L / 2, L / 2, 0, 0.86, W / 2 - 0.6, W / 2, M.appliance, 0.02);
        [-W / 2 + 0.3, W / 2 - 0.3].forEach((z) => { const d = add(g, new T.CircleGeometry(0.19, 32), M.darkStone, L / 2 + 0.002, 0.48, z, false); d.rotation.y = Math.PI / 2; });
      });
      [[505, 495, 540, 517], [550, 495, 585, 517]].forEach((r) => orient(r, 'N', (g, L, W) => {
        bx(g, -L / 2, L / 2, 0.05, 0.8, -W / 2, W / 2, M.appliance, 0.02);
        const d = add(g, new T.CircleGeometry(0.26, 32), M.darkStone, L / 2 + 0.003, 0.42, 0, false); d.rotation.y = Math.PI / 2;
      }));
      // entry: lobby console, shoe cabinet, entry terrace with sky garden
      orient([167, 627, 217, 638], 'S', (g, L, W) => { bx(g, -L / 2, L / 2, 0.15, 0.85, -W / 2, W / 2, M.walnut, 0.015); cyl(g, 0.1, 0.07, 0.3, 0, 0.85, W / 2 - 0.3, M.ceramic, 18); });
      orient([139, 650, 155, 690], 'W', (g, L, W) => wardrobe(g, L, W, 2.1));
      orient([388, 548, 406, 568], 'E', armchair);
      orient([388, 600, 406, 620], 'E', armchair);
      round(398, 584, 0.2, 0.45, M.stoneTop, M.metal);
      // sky garden: a planted bed with a tree
      bx(root, X(322), X(410), 0, 0.12, Z(398), Z(525), M.garden);
      tree(366, 455, 0.75);
      {
        const g = new T.Group(); g.position.set(X(366), 0.12, Z(455)); root.add(g);
        for (let k = 0; k < 9; k++) { const q = new T.Group(); q.position.set((rnd() - 0.5) * 1.7, 0, (rnd() - 0.5) * 2.6); g.add(q); blades(q, 7, 0.3, 0, 0.05); }
      }
      // bedrooms
      orient([600, 535, 672, 592], 'W', bed);
      orient([600, 514, 616, 532], 'W', nightstand);
      orient([600, 595, 616, 613], 'W', nightstand);
      orient([699, 525, 712, 592], 'E', media);
      orient([615, 620, 665, 640], 'S', (g, L, W) => table(g, L, W, 0.75, M.oak, M.metal));
      orient([630, 604, 650, 620], 'N', chair);
      orient([242, 752, 317, 812], 'E', bed);
      orient([301, 733, 317, 750], 'E', nightstand);
      orient([301, 814, 317, 831], 'E', nightstand);
      orient([203, 742, 217, 820], 'W', media);
      orient([240, 698, 315, 713], 'N', wardrobe);
      rug([712, 704, 812, 808], M.rug2);
      orient([722, 715, 800, 797], 'W', bed);
      orient([722, 698, 740, 714], 'W', nightstand);
      orient([722, 798, 740, 814], 'W', nightstand);
      orient([832, 715, 847, 810], 'E', media);
      orient([825, 626, 920, 642], 'N', wardrobe);
      orient([913, 645, 930, 685], 'E', wardrobe);
      orient([793, 650, 813, 668], 'N', (g, L, W) => bx(g, -L / 2, L / 2, 0.05, 0.45, -W / 2, W / 2, M.head, 0.05));
      plant(734, 832, 0.9);
      // bathrooms
      orient([264, 452, 290, 476], 'N', wc);
      orient([258, 488, 278, 514], 'W', (g, L, W) => vanity(g, L, W, [0]));
      orient([747, 584, 777, 604], 'E', wc);
      orient([755, 612, 777, 641], 'E', (g, L, W) => vanity(g, L, W, [0]));
      orient([141, 699, 162, 724], 'W', (g, L, W) => vanity(g, L, W, [0]));
      orient([141, 733, 165, 757], 'W', wc);
      orient([906, 712, 930, 768], 'E', (g, L, W) => vanity(g, L, W, [-0.33, 0.33]));
      orient([898, 772, 916, 792], 'E', wc);
      {
        // freestanding oval tub
        const g = new T.Group(); g.position.set(X(892), 0, Z(867)); g.scale.set(1.0, 1, 0.48); root.add(g);
        const r = 0.85;
        const pts = [[0, 0.1], [r - 0.12, 0.12], [r - 0.07, 0.3], [r - 0.06, 0.56], [r - 0.02, 0.6], [r, 0.56], [r - 0.01, 0.2], [r - 0.08, 0.02], [0, 0]].map(([a, b]) => new T.Vector2(a, b));
        add(g, new T.LatheGeometry(pts, 48), M.ceramic, 0, 0, 0);
        const w = add(g, new T.CircleGeometry(r - 0.1, 40), M.water, 0, 0.46, 0, false); w.rotation.x = -Math.PI / 2;
      }
      [[737, 553], [875, 810], [172, 785]].forEach(([x, y]) => cyl(root, 0.11, 0.11, 0.015, X(x), 2.05, Z(y), M.steel, 20));
      // deck + loggia
      orient([530, 862, 552, 925], 'N', lounger);
      orient([580, 862, 602, 925], 'N', lounger);
      round(566, 880, 0.2, 0.45, M.stoneTop, M.walnut);
      orient([447, 868, 473, 940], 'N', lounger);
      round(487, 930, 0.3, 0.4, M.walnut, M.walnut);
      plant(690, 925, 1.1); plant(540, 957, 0.8); plant(830, 870, 0.9);
      orient([735, 853, 790, 880], 'N', (g, L, W) => sofa(g, L, W, 2));
      // glass balcony along the bedroom 3 / living façade
      plant(215, 868, 0.8); plant(420, 868, 0.8);
    }

    function tree(x, y, s = 1) {
      const g = new T.Group(); g.position.set(X(x), 0, Z(y)); root.add(g);
      cyl(g, 0.05 * s, 0.085 * s, 1.9 * s, 0, 0.1, 0, M.bark, 12);
      canopy(g, 46, 0.85 * s, 0.6 * s, 2.3 * s, 0.16 * s, 0.3 * s);
    }
    function bush(x, y, s = 1) {
      const g = new T.Group(); g.position.set(X(x), 0, Z(y)); root.add(g);
      canopy(g, 16, 0.38 * s, 0.26 * s, 0.42 * s, 0.12 * s, 0.2 * s);
    }
    function backRun(g, L, W, ovenEnd) {
      const col = 0.62, z0 = -W / 2 + col, z1 = W / 2 - col;
      [[-W / 2, z0], [z1, W / 2]].forEach(([a, b], i) => {
        bx(g, -L / 2, L / 2, 0.02, 2.4, a + 0.004, (a + b) / 2 - 0.003, M.oak, 0.006);
        bx(g, -L / 2, L / 2, 0.02, 2.4, (a + b) / 2 + 0.003, b - 0.004, M.oak, 0.006);
        if (i === ovenEnd) { bx(g, L / 2 - 0.02, L / 2 + 0.005, 0.85, 1.45, a + 0.05, b - 0.05, M.black, 0.01); bx(g, L / 2 - 0.02, L / 2 + 0.005, 1.5, 1.95, a + 0.05, b - 0.05, M.black, 0.01); }
      });
      const run = new T.Group(); g.add(run); run.position.z = (z0 + z1) / 2;
      counter(run, L, z1 - z0, {});
      bx(g, -L / 2, -L / 2 + 0.02, 0.92, 1.5, z0, z1, M.stoneTop);
      bx(g, -L / 2, -L / 2 + 0.36, 1.5, 2.4, z0 + 0.003, z1 - 0.003, M.oak, 0.006);
      bx(g, -L / 2 + 0.3, -L / 2 + 0.34, 1.485, 1.5, z0 + 0.05, z1 - 0.05, M.bulb);
    }
    function furnishPenthouse() {
      // junior master suite
      orient([70, 231, 140, 242], 'N', wardrobe);
      rug([126, 270, 178, 330], M.rug2);
      orient([130, 273, 179, 327], 'E', bed);
      orient([170, 263, 179, 272], 'E', nightstand);
      orient([170, 328, 179, 337], 'E', nightstand);
      orient([112, 280, 119, 322], 'W', media);
      orient([68, 268, 80, 282], 'W', (g, L, W) => vanity(g, L, W, [0]));
      orient([68, 286, 83, 300], 'W', wc);
      orient([70, 353, 105, 370], 'S', tubRect);
      // bedroom 4 + bathroom 4
      orient([203, 178, 245, 208], 'E', bed);
      orient([237, 210, 245, 219], 'E', nightstand);
      orient([212, 230, 238, 240], 'S', (g, L, W) => table(g, L, W, 0.75, M.oak, M.metal));
      orient([151, 203, 164, 217], 'W', wc);
      orient([151, 222, 161, 238], 'W', (g, L, W) => vanity(g, L, W, [0]));
      // service: wet kitchen, yard, maid
      orient([250, 180, 300, 190], 'N', (g, L, W) => counter(g, L, W, { sinks: [0.3], uppers: true }));
      orient([250, 190, 259, 240], 'W', (g, L, W) => counter(g, L, W, { hobs: [0] }));
      orient([308, 154, 336, 167], 'N', (g, L, W) => {
        bx(g, -L / 2, L / 2, 0, 0.86, -W / 2, -W / 2 + 0.6, M.appliance, 0.02);
        bx(g, -L / 2, L / 2, 0, 0.86, W / 2 - 0.6, W / 2, M.appliance, 0.02);
      });
      orient([345, 110, 381, 142], 'E', bed);
      orient([366, 145, 380, 171], 'E', wardrobe);
      orient([306, 222, 319, 238], 'W', wc);
      orient([344, 179, 355, 239], 'W', wardrobe);
      orient([410, 137, 425, 150], 'N', wc);
      orient([417, 155, 426, 169], 'E', (g, L, W) => vanity(g, L, W, [0]));
      orient([741, 137, 755, 150], 'N', wc);
      orient([739, 155, 748, 169], 'W', (g, L, W) => vanity(g, L, W, [0]));
      orient([440, 226, 474, 233], 'S', (g, L, W) => { bx(g, -L / 2, L / 2, 0.15, 0.85, -W / 2, W / 2, M.walnut, 0.015); });
      // living / dining / gallery kitchen
      rug([207, 277, 257, 328], M.rug);
      orient([242, 282, 257, 325], 'E', (g, L, W) => sofa(g, L, W, 3));
      orient([219, 265, 234, 279], 'N', armchair);
      orient([219, 324, 234, 338], 'S', armchair);
      orient([219, 292, 236, 314], 'W', (g, L, W) => table(g, L, W, 0.36, M.stoneTop, M.oakDark));
      orient([188, 280, 194, 328], 'W', media);
      plant(196, 343, 1.0);
      orient([288, 272, 308, 332], 'W', (g, L, W) => table(g, L, W, 0.75, M.oak, M.oakDark));
      [276, 289, 302, 315].forEach((y) => { orient([279, y, 288, y + 10], 'W', chair); orient([308, y, 317, y + 10], 'E', chair); });
      pendantsZ(298, 280, 325, 3);
      orient([333, 278, 357, 328], 'E', (g, L, W) => counter(g, L, W, { sinks: [-0.6], hobs: [0.6], over: 0.25, base: M.walnut }));
      stool(327, 290); stool(327, 303); stool(327, 316);
      pendantsZ(345, 283, 323, 2, 1.85);
      orient([377, 268, 390, 348], 'E', (g, L, W) => backRun(g, L, W, 1));
      // bedroom 3 + bathroom 3
      orient([397, 268, 430, 278], 'N', wardrobe);
      orient([397, 298, 436, 333], 'W', bed);
      orient([397, 288, 406, 297], 'W', nightstand);
      orient([397, 334, 406, 343], 'W', nightstand);
      orient([458, 268, 490, 278], 'N', wardrobe);
      orient([479, 306, 488, 322], 'E', (g, L, W) => vanity(g, L, W, [0]));
      orient([474, 337, 488, 352], 'E', wc);
      // master suite
      orient([500, 268, 555, 280], 'N', wardrobe);
      orient([580, 268, 662, 280], 'N', wardrobe);
      rug([598, 304, 665, 374], M.rug);
      orient([620, 310, 666, 367], 'E', bed);
      orient([657, 300, 666, 309], 'E', nightstand);
      orient([657, 368, 666, 377], 'E', nightstand);
      orient([557, 318, 565, 360], 'W', media);
      orient([643, 377, 664, 398], 'E', armchair);
      plant(573, 398, 0.9);
      orient([541, 308, 550, 356], 'E', (g, L, W) => vanity(g, L, W, [-0.4, 0.4]));
      orient([498, 304, 512, 322], 'N', wc);
      tubRound(526, 394, 0.68);
      [[515, 342], [85, 330], [165, 192]].forEach(([x, y]) => cyl(root, 0.11, 0.11, 0.015, X(x), 2.05, Z(y), M.steel, 20));
      // tea room
      orient([683, 274, 718, 292], 'N', (g, L, W) => sofa(g, L, W, 3));
      orient([692, 302, 712, 315], 'W', (g, L, W) => table(g, L, W, 0.36, M.walnut, M.oakDark));
      orient([688, 334, 717, 342], 'S', (g, L, W) => { bx(g, -L / 2, L / 2, 0.1, 0.5, -W / 2, W / 2, M.walnut, 0.015); });
      plant(726, 340, 0.8);
      // pool pavilion
      orient([825, 168, 843, 208], 'W', (g, L, W) => sofa(g, L, W, 2));
      orient([853, 163, 900, 180], 'N', (g, L, W) => sofa(g, L, W, 3));
      orient([884, 180, 900, 212], 'E', (g, L, W) => sofa(g, L, W, 2));
      orient([848, 196, 862, 210], 'S', armchair);
      round(869, 192, 0.32, 0.38, M.stoneTop, M.walnut);
      orient([927, 162, 943, 210], 'W', (g, L, W) => table(g, L, W, 0.75, M.oak, M.oakDark));
      [165, 180, 195].forEach((y) => { orient([919, y, 927, y + 10], 'W', chair); orient([943, y, 951, y + 10], 'E', chair); });
      pendantsZ(935, 168, 204, 2);
      orient([970, 162, 982, 203], 'E', (g, L, W) => counter(g, L, W, { uppers: true }));
      orient([1003, 205, 1015, 232], 'E', (g, L, W) => counter(g, L, W, { sinks: [0] }));
      // outdoors: decks, pond, pools, gardens
      orient([192, 355, 205, 388], 'N', lounger);
      orient([218, 355, 232, 388], 'N', lounger);
      round(211, 366, 0.2, 0.45, M.stoneTop, M.walnut);
      tree(306, 393, 0.9);
      tree(797, 125, 0.5);
      cyl(root, 0.012, 0.012, 2.2, X(797), 0, Z(158), M.steel, 8);
      orient([1042, 238, 1054, 267], 'N', lounger);
      orient([1068, 238, 1082, 267], 'N', lounger);
      round(1061, 248, 0.2, 0.45, M.stoneTop, M.walnut);
      orient([752, 295, 785, 307], 'W', lounger);
      orient([752, 323, 785, 337], 'W', lounger);
      round(757, 315, 0.2, 0.45, M.stoneTop, M.walnut);
      bush(1024, 360, 1.1); bush(1070, 360, 1.1);
      plant(745, 400, 1.1); plant(470, 400, 0.9); plant(725, 400, 1.0);
    }

    if (kind === 'riviere') {
    // ---------------------------------------------------------------- living / dining / kitchen
    rug([380, 346, 492, 476], M.rug);
    orient([452, 362, 492, 460], 'E', (g, L, W) => sofa(g, L, W, 3));
    orient([396, 352, 432, 385], 'N', armchair);
    orient([396, 438, 432, 471], 'S', armchair);
    orient([400, 391, 428, 432], 'W', (g, L, W) => { table(g, L, W, 0.36, M.stoneTop, M.oakDark); });
    orient([327, 358, 345, 466], 'W', media);
    round(470, 345, 0.24, 0.5, M.walnut, M.walnut);
    plant(345, 488, 1.0);
    orient([552, 345, 597, 477], 'W', (g, L, W) => table(g, L, W, 0.75, M.oak, M.oakDark));
    [355, 387, 417, 447].forEach((y) => {
      orient([533, y, 550, y + 22], 'W', chair);
      orient([599, y, 616, y + 22], 'E', chair);
    });
    pendantsZ(575, 355, 470, 3);
    orient([650, 357, 707, 472], 'E', (g, L, W) => counter(g, L, W, { sinks: [-(W / 2 - 0.5)], hobs: [0.35], over: 0.25, base: M.walnut }));
    stool(637, 382); stool(637, 418); stool(637, 452);
    pendantsZ(678, 362, 468, 2, 1.85);
    orient([752, 334, 779, 506], 'E', (g, L, W) => {
      // tall columns at both ends (pantry / fridge, oven stack), worktop run between with open shelf + uppers
      const col = 0.62, z0 = -W / 2 + col, z1 = W / 2 - col;
      [[-W / 2, z0], [z1, W / 2]].forEach(([a, b], i) => {
        bx(g, -L / 2, L / 2, 0.02, 2.4, a + 0.004, (a + b) / 2 - 0.003, M.oak, 0.006);
        bx(g, -L / 2, L / 2, 0.02, 2.4, (a + b) / 2 + 0.003, b - 0.004, M.oak, 0.006);
        if (i === 1) {
          bx(g, L / 2 - 0.02, L / 2 + 0.005, 0.85, 1.45, a + 0.05, b - 0.05, M.black, 0.01);
          bx(g, L / 2 - 0.02, L / 2 + 0.005, 1.5, 1.95, a + 0.05, b - 0.05, M.black, 0.01);
          bx(g, L / 2 + 0.005, L / 2 + 0.02, 1.4, 1.42, a + 0.1, b - 0.1, M.steel);
        }
      });
      const run = new T.Group(); g.add(run); run.position.z = (z0 + z1) / 2;
      counter(run, L, z1 - z0, { sinks: [], hobs: [] });
      bx(g, -L / 2, -L / 2 + 0.02, 0.92, 1.5, z0, z1, M.stoneTop);                // stone splashback
      bx(g, -L / 2, -L / 2 + 0.36, 1.5, 2.4, z0 + 0.003, z1 - 0.003, M.oak, 0.006); // uppers
      const nu = Math.round((z1 - z0) / 0.55);
      for (let i = 1; i < nu; i++) { const z = z0 + ((z1 - z0) * i) / nu; bx(g, -L / 2 + 0.36, -L / 2 + 0.362, 1.52, 2.38, z - 0.002, z + 0.002, M.oakDark); }
      bx(g, -L / 2 + 0.3, -L / 2 + 0.34, 1.485, 1.5, z0 + 0.05, z1 - 0.05, M.bulb);  // under-cabinet light strip
      cyl(g, 0.11, 0.08, 0.2, L / 2 - 0.3, 0.92, -0.5, M.ceramic, 20);               // a bowl on the worktop
      bx(g, -L / 2 + 0.05, -L / 2 + 0.3, 0.92, 1.25, 0.6, 0.9, M.walnut, 0.02);       // cutting boards
    });
    // wet kitchen, yard, AC ledge
    orient([462, 138, 580, 160], 'N', (g, L, W) => counter(g, L, W, { sinks: [-(X(537) - X(521))], uppers: true }));
    orient([462, 160, 481, 262], 'W', (g, L, W) => counter(g, L, W, { hobs: [Z(212) - Z(211)] }));
    orient([545, 218, 573, 265], 'E', (g, L, W) => counter(g, L, W, {}));
    orient([600, 88, 662, 112], 'N', (g, L, W) => {
      bx(g, -L / 2, L / 2, 0, 0.86, -W / 2, -W / 2 + 0.62, M.appliance, 0.02);
      bx(g, -L / 2, L / 2, 0, 0.86, W / 2 - 0.62, W / 2, M.appliance, 0.02);
      [-W / 2 + 0.31, W / 2 - 0.31].forEach((z) => { const d = add(g, new T.CircleGeometry(0.19, 32), M.darkStone, L / 2 + 0.002, 0.48, z, false); d.rotation.y = Math.PI / 2; });
    });
    [[470, 92, 510, 120], [520, 92, 560, 120]].forEach((r) => orient(r, 'N', (g, L, W) => {
      bx(g, -L / 2, L / 2, 0.05, 0.8, -W / 2, W / 2, M.appliance, 0.02);
      const d = add(g, new T.CircleGeometry(0.26, 32), M.darkStone, L / 2 + 0.003, 0.42, 0, false); d.rotation.y = Math.PI / 2;
    }));

    // ---------------------------------------------------------------- bedrooms
    // junior master suite
    rug([192, 350, 300, 474], M.rug2);
    orient([222, 365, 309, 455], 'E', bed);
    orient([290, 344, 309, 362], 'E', nightstand);
    orient([290, 458, 309, 476], 'E', nightstand);
    orient([160, 356, 176, 466], 'W', media);
    orient([62, 250, 190, 272], 'N', wardrobe);
    orient([62, 275, 76, 322], 'W', wardrobe);
    // bedroom 4
    orient([365, 140, 452, 212], 'E', bed);
    orient([432, 116, 452, 137], 'E', nightstand);
    orient([432, 214, 452, 235], 'E', nightstand);
    orient([318, 130, 334, 222], 'W', wardrobe);
    orient([376, 245, 450, 268], 'S', (g, L, W) => table(g, L, W, 0.75, M.oak, M.metal));
    orient([400, 228, 422, 247], 'N', chair);
    // bedroom 3
    orient([790, 395, 880, 462], 'W', bed);
    orient([790, 376, 810, 394], 'W', nightstand);
    orient([790, 463, 810, 481], 'W', nightstand);
    orient([790, 334, 870, 352], 'N', wardrobe);
    orient([910, 385, 927, 450], 'E', media);
    // master bedroom + walk-in
    rug([1240, 338, 1392, 486], M.rug);
    orient([1300, 350, 1393, 465], 'E', bed);
    orient([1262, 365, 1298, 450], 'W', (g, L, W) => { bx(g, -L / 2, L / 2, 0.08, 0.46, -W / 2, W / 2, M.head, 0.05); });
    orient([1372, 330, 1393, 349], 'E', nightstand);
    orient([1372, 466, 1393, 485], 'E', nightstand);
    orient([1157, 362, 1173, 452], 'W', media);
    orient([1350, 490, 1390, 528], 'E', armchair);
    round(1322, 518, 0.22, 0.45, M.stoneTop, M.metal);
    plant(1180, 545, 0.9);
    orient([1068, 246, 1344, 271], 'N', wardrobe);
    // maid bedroom, shoe room
    orient([700, 90, 775, 135], 'E', bed);
    orient([755, 147, 777, 185], 'E', wardrobe);
    orient([681, 196, 698, 266], 'W', wardrobe);
    orient([700, 194, 770, 206], 'N', (g, L, W) => wardrobe(g, L, W, 1.1));

    // ---------------------------------------------------------------- bathrooms
    orient([247, 180, 272, 202], 'W', wc);
    orient([246, 216, 272, 248], 'W', (g, L, W) => vanity(g, L, W, [0]));
    orient([65, 336, 92, 366], 'W', (g, L, W) => vanity(g, L, W, [0]));
    orient([64, 380, 90, 405], 'W', wc);
    orient([66, 470, 148, 507], 'S', tubRect);
    orient([588, 230, 606, 256], 'W', wc);
    orient([655, 220, 671, 244], 'E', (g, L, W) => vanity(g, L, W, [0]));
    orient([822, 38, 848, 64], 'N', wc);
    orient([835, 86, 860, 114], 'E', (g, L, W) => vanity(g, L, W, [0]));
    orient([978, 336, 1000, 368], 'E', (g, L, W) => vanity(g, L, W, [0]));
    orient([976, 378, 1000, 402], 'E', wc);
    orient([1025, 333, 1047, 358], 'N', wc);
    orient([1115, 334, 1145, 466], 'E', (g, L, W) => vanity(g, L, W, [-0.62, 0.62]));
    tubRound(1062, 517, 0.72);
    [[120, 440], [957, 435], [1042, 412]].forEach(([x, y]) => cyl(root, 0.11, 0.11, 0.015, X(x), 2.05, Z(y), M.steel, 20));

    // ---------------------------------------------------------------- outdoors
    orient([432, 527, 462, 602], 'N', lounger);
    orient([492, 527, 522, 602], 'N', lounger);
    round(477, 549, 0.2, 0.45, M.stoneTop, M.walnut);
    orient([1222, 580, 1250, 652], 'N', lounger);
    orient([1282, 580, 1310, 652], 'N', lounger);
    round(1266, 598, 0.2, 0.45, M.stoneTop, M.walnut);
    plant(348, 610, 1.1); plant(1370, 640, 1.1); plant(976, 640, 0.9); plant(85, 548, 0.9); plant(285, 548, 0.85);
    orient([140, 525, 230, 560], 'N', (g, L, W) => sofa(g, L, W, 2));
    round(185, 568, 0.22, 0.4, M.walnut, M.walnut);
    orient([1005, 160, 1012, 215], 'E', () => {}); // entrance (door opening only)

    }
    if (kind === 'jardin') furnishJardin();
    if (kind === 'penthouse') furnishPenthouse();

    return root;
  }

  // warm interior lights, only while the residence is open
  function lights(T, kind) {
    const S = SPEC[kind];
    [OX, OY, SX, SZ] = S.frame;
    const g = new T.Group();
    S.LIGHTS.forEach(([x, y, i]) => {
      const l = new T.PointLight(0xffddb8, i * 0.75, 7.5, 1.8);
      l.position.set(X(x), 2.1, Z(y));
      g.add(l);
    });
    return g;
  }

  // clean outer outline of each residence (module metres), derived from the plan data above — used for hover / selection
  const OUTLINES = {"riviere":[[30.2,4.83],[21.58,4.83],[21.58,2.76],[20.65,2.76],[20.65,0.2],[16.18,0.2],[16.18,1.5],[5.78,1.5],[5.78,2.76],[4.12,2.76],[4.12,4.83],[0.05,4.83],[0.05,12.25],[5.78,12.25],[5.78,13.65],[11.18,13.65],[11.18,14.2],[30.2,14.2]],"jardin":[[0.85,1.25],[0.85,3.54],[0.0,3.54],[0.0,13.08],[8.12,13.08],[8.12,14.95],[11.43,14.95],[11.43,14.4],[15.62,14.4],[15.62,13.08],[21.4,13.08],[21.4,5.8],[17.32,5.8],[17.32,3.54],[15.62,3.54],[15.62,2.5],[7.48,2.5],[7.48,0.1],[5.18,0.1],[5.18,1.25]],"penthouse":[[0.05,6.36],[0.05,13.3],[6.0,13.3],[6.0,15.23],[36.52,15.23],[36.52,14.5],[45.03,14.5],[45.03,13.3],[50.95,13.3],[50.95,6.36],[46.94,6.36],[46.94,2.58],[37.38,2.58],[37.38,0.12],[34.98,0.12],[34.98,1.35],[30.65,1.35],[30.65,3.85],[29.7,3.85],[29.7,6.36],[21.43,6.36],[21.43,3.85],[20.6,3.85],[20.6,1.35],[16.28,1.35],[16.28,0.12],[13.65,0.12],[13.65,2.58],[6.0,2.58],[6.0,3.85],[4.17,3.85],[4.17,6.36]]};
  const H_ = {};
  Object.keys(SPEC).forEach((k) => (H_[k] = { w: SPEC[k].w, d: SPEC[k].d, outline: OUTLINES[k], build: (T, ext) => build(T, ext, k), lights: (T) => lights(T, k) }));
  window.DEFINE_HAND = Object.assign(window.DEFINE_HAND || {}, H_);
})();
