const request = require("supertest");
const app = require("../app");

describe("get all routes without specifying time and steps", () => {
  const start = "CC21";
  const destination = "DT14";
  const matchingPath = "CC21,CC20,CC19,DT9,DT10,DT11,DT12,DT13,DT14";
  let response, paths;

  test("should get 200 response status", async () => {
    response = await request(app)
      .get(`/api/mrt/routes?start=${start}&destination=${destination}`)
      .expect(200);
    paths = response.body.data;
  });

  test("the response data array should not be greather than 4", () => {
    expect(paths.length).toBeLessThan(5);
  });

  test("the first path in the response data array have a duration of 8", () => {
    expect(paths[0].duration).toBe(8);
  });

  test("the first path in the response data match the matchingPath", () => {
    expect(paths[0].path.join(",")).toBe(matchingPath);
  });
});

describe("get all routes with start time indicated (peak hr)", () => {
  test("should be 12 min for each stop in NS line", async () => {
    const start = "NS1";
    const destination = "NS2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T06:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(12);
  });

  test("should be 12 min for each stop in NE line", async () => {
    const start = "NE3";
    const destination = "NE4";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T06:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(12);
  });

  test("should be 130 min from CC14 to DT13 that covers other line 10min/station and 15min line change", async () => {
    const start = "CC14";
    const destination = "DT13";
    const matchingPath =
      "CC14,CC13,CC12,CC11,CC10,CC9,EW8,EW9,EW10,EW11,EW12,DT14,DT13";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T06:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[1].duration).toBe(130);
    expect(paths[1].path.join(",")).toBe(matchingPath);
  });
});

describe("get all routes with start time indicated (night hr)", () => {
  test("should be empty paths since DT line is not operating", async () => {
    const start = "DT1";
    const destination = "DT2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths.length).toBe(0);
  });
  test("should be empty paths since CG line is not operating", async () => {
    const start = "CG1";
    const destination = "CG2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths.length).toBe(0);
  });

  test("should be empty paths since CE line is not operating", async () => {
    const start = "CE1";
    const destination = "CE2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths.length).toBe(0);
  });

  test("should be 8 min for each stop in TE line", async () => {
    const start = "TE1";
    const destination = "TE2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(8);
  });

  test("should be 10 min for each stop in EW line", async () => {
    const start = "EW1";
    const destination = "EW2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(10);
  });

  test("should be 60 min from NS16 to NE13 that covers NS, CC, NE line 10min/station and 10min line change", async () => {
    const start = "NS16";
    const destination = "NE13";
    const matchingPath = "NS16,NS17,CC15,CC14,CC13,NE12,NE13";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T22:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(60);
    expect(paths[0].path.join(",")).toBe(matchingPath);
  });
});

describe("get all routes with start time indicated (non-peak hr)", () => {
  test("should be 8 min for each stop in TE line", async () => {
    const start = "TE1";
    const destination = "TE2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(8);
  });
  test("should be 8 min for each stop in DT line", async () => {
    const start = "DT1";
    const destination = "DT2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(8);
  });

  test("should be 10 min for each stop in EW line", async () => {
    const start = "EW1";
    const destination = "EW2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(10);
  });

  test("should be 10 min for each stop in CG line", async () => {
    const start = "CG1";
    const destination = "CG2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(10);
  });

  test("should be 10 min for each stop in CE line", async () => {
    const start = "CE1";
    const destination = "CE2";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(10);
  });

  test("should be 60 min from NS16 to NE13 that covers NS, CC, NE line 10min/station and 10min line change", async () => {
    const start = "NS16";
    const destination = "NE13";
    const matchingPath = "NS16,NS17,CC15,CC14,CC13,NE12,NE13";
    let response, paths;

    response = await request(app)
      .get(
        `/api/mrt/routes?start=${start}&destination=${destination}&time=2022-03-28T10:00`
      )
      .expect(200);

    paths = response.body.data;
    expect(paths[0].duration).toBe(60);
    expect(paths[0].path.join(",")).toBe(matchingPath);
  });
});
