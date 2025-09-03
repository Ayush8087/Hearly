let api_url = process.env.NEXT_PUBLIC_API_URL || 'https://hearly.onrender.com/';
if (!api_url.endsWith('/')) api_url = api_url + '/';
if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('NEXT_PUBLIC_API_URL not set. Using default https://hearly.onrender.com/');
}

export const getSongsByQuery = async (e) => {
    try {
        return await fetch(`${api_url}search/songs?query=` + e);
    }
    catch (e) {
        console.log(e);
    }
};

export const getSongsById = async (e) => {
    try {
        return await fetch(`${api_url}songs/` + e);
    }
    catch (e) {
        console.log(e);
    }
};

export const getSongsSuggestions = async (e) => {
    try {
        return await fetch(`${api_url}songs/${e}/suggestions`);
    }
    catch (e) {
        console.log(e);
    }
};

export const searchAlbumByQuery = async (e) => {
    try {
        return await fetch(`${api_url}search/albums?query=` + e);
    }
    catch (e) {
        console.log(e);
    }
};

export const getAlbumById = async (e) => {
    try {
        return await fetch(`${api_url}albums?id=` + e);
    }
    catch (e) {
        console.log(e);
    }
};