import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

import { getOrCreateAssociatedTokenAccount } from "../../utils/transferSpl/getOrCreateAssociatedTokenAccount";

import { Idl } from "@project-serum/anchor/dist/cjs/idl";
import React, { Component, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";

const programID = new PublicKey(idl.metadata.address);

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  const opts = {
    preflightCommitment: "processed",
  };

  const getProvider = () => {
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }
    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signerWallet, {
      preflightCommitment: "recent",
    });

    return provider;
  };

  const createEscrow = async () => {
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);
    console.log(program.programId.toBase58());
    console.log(connection);

    const mint = new PublicKey("44GpxBdhPsoPgP96pYCvGFFWojuSoThuiLuwuB3qx2cm");
    const admin1 = new PublicKey(
      "HtjDrqiL7fLVGKwNK96M54pVDwXmas5G7hNSPPfzRZJd"
    );
    const admin2 = new PublicKey(
      "BddjKVEuSUbmAv7cyXKyzBUQDUHshwihWmkoqwXmpwvi"
    );
    const taker = new PublicKey("G8sD4NoRjH6ifD9WxuV3d94nytKTEn5ZLpZDdEx4PZsa");
    const resolver = new PublicKey(
      "3Y3HS9Twxsm6wRcqmgDBzmz1ggD87siqDvS3FzmPBnvH"
    );

    let admin2TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      publicKey,
      mint,
      admin2,
      signTransaction
    );

    let initializerDepositTokenAccount =
      await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey,
        signTransaction
      );

    const adminSeed = "admin";
    const stateSeed = "state";
    const vaultSeed = "vault";
    const authoritySeed = "authority";

    const randomSeed: anchor.BN = new anchor.BN(
      Math.floor(Math.random() * 100000000)
    );

    // Derive PDAs: escrowStateKey, vaultKey, vaultAuthorityKey
    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];
    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.initialize(
        randomSeed,
        [
          new anchor.BN(50),
          new anchor.BN(150),
          new anchor.BN(200),
          new anchor.BN(50),
          new anchor.BN(50),
        ],
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            vault: vaultKey,
            admin1,
            resolver,
            admin2TokenAccount: admin2TokenAccount.address,
            mint,
            initializerDepositTokenAccount:
              initializerDepositTokenAccount.address,
            escrowState: escrowStateKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      tx.feePayer = provider.wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      // const signedTx = await provider.wallet.signTransaction(tx);
      // const txId = await connection.sendRawTransaction(signedTx.serialize());
      // await connection.confirmTransaction(txId);
    } catch (err) {
      // console.log(err.message);
      console.log(err);
    }
  };

  const [faqNum, setFaqNum] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-dashboard-backcolor min-h-[100vh] px-[49px]">
      {stage === 0 && (
        <div>
          <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
            Dashboard
          </div>
          <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
            Overview of your escrows and performance.
          </div>
          <div className="mt-[35px] grid grid-cols-3 gap-4">
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
          </div>
          <div className="mt-[51.37px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
          <div className="mt-[35.63px] flex justify-between items-center">
            <div className="flex items-center">
              <div className="font-[600] text-[22px] leading-[26px]">
                My Escrows
              </div>
              <div
                className="ml-[32px] rounded-[10px] w-[115px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor font-[600] text-[18px] leading-[21px] cursor-pointer"
                onClick={() => setStage(1)}
              >
                CREATE
              </div>
            </div>
            <div className="rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[246px] h-[42px] p-[3px] flex justify-between items-center">
              <div className="w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer">
                Active
              </div>
              <div className="w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer">
                Completed
              </div>
            </div>
          </div>
          <div className="mt-[46px] pb-[177px] grid grid-cols-3 gap-4">
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
          </div>
        </div>
      )}
      {stage === 1 && (
        <div className="pb-[249px]">
          <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
            Create Escrow
          </div>
          <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
            Create a new escrow and protect your payments.
          </div>
          <div className="mt-[35px] grid grid-cols-2 gap-4">
            <div className="pt-[23px] pr-[23px]">
              <div className="flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Description</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
              <div className="mt-[30px] flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Receiver</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
              <div className="mt-[30px] flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Moderator</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
              <div className="mt-[30px] flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Amount</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
              <div className="mt-[61.37px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
            </div>
            <div className="rounded-[10px] bg-fee-panel-bgcolor p-[23px] px-[43px]">
              <div className="font-[800] text-[32px] leading-[38px]">Fees</div>
              <div className="mt-[43px] flex justify-between items-center">
                <div className="text-[20px] leading-[23px">
                  Platform fee(5%)
                </div>
                <div className="text-[20px] font-[600]">50 USDC</div>
              </div>
              <div className="mt-[37px] flex justify-between items-center">
                <div className="text-[20px] leading-[23px">
                  Holder Discount (1%)
                </div>
                <div className="text-[20px] font-[600]">10 USDC</div>
              </div>
              <div className="mt-[41px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
              <div className="mt-[25px] flex justify-between items-center">
                <div className="text-[20px] leading-[23px">Total</div>
                <div className="text-[20px] font-[600]">1040 USDC</div>
              </div>
            </div>
          </div>
          <div className="mt-[47px] grid grid-cols-2 gap-4">
            <div className="pr-[23px]">
              <div className="flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Milestones</div>
                <div className="w-[110px] h-[40px] mr-[220px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer">
                  ADD +
                </div>
              </div>
              <div className="mt-[36px] flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Milestone 1</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
              <div className="mt-[30px] flex justify-between items-center">
                <div className="w-[110px] text-[20px]">Amount</div>
                <input
                  type="text"
                  className="w-[330px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-input-box-bgcolor"
                />
              </div>
            </div>
            <div
              className="w-[120px] h-[40px] mr-[220px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer"
              onClick={createEscrow}
            >
              CREATE
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
