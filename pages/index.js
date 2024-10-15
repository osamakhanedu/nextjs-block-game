import Head from 'next/head'
import BlockPuzzle from '../components/BlockPuzzle'

export default function Home() {
    return (
        <div style={{ height: '100vh', overflow: 'hidden' }}>
            <Head>
                <title>Block Puzzle Game</title>
                <meta name="description" content="A simple block puzzle game built with Next.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <BlockPuzzle />
        </div>
    )
}
