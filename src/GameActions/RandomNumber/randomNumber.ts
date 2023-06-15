const RandomNumber = async (min: number, max: number) => {

    const RendomNumber: number = Math.floor(Math.random() * ((max + 1) - min)) + min;
    return RendomNumber

}

export { RandomNumber };