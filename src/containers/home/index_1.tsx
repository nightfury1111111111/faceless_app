import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAccount,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

import { getOrCreateAssociatedTokenAccount } from "../../utils/transferSpl/getOrCreateAssociatedTokenAccount";
import { getAssociatedTokenAddress } from "../../utils/transferSpl/getAssociatedTokerAddress";
import { getAccountInfo } from "../../utils/transferSpl/getAccountInfo";
import { createAssociatedTokenAccountInstruction } from "../../utils/transferSpl/createAssociatedTokenAccountInstruction";

import { Idl } from "@project-serum/anchor/dist/cjs/idl";
import React, { Component, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PublicKey, Transaction } from "@solana/web3.js";
import idl from "../../idl.json";

import { constants } from "../../constants";
import { validateAddress } from "../../utils/general";
import { useAtom } from "jotai";
import { profile, profileModerators } from "../../utils/store";
import axios from "axios";

export interface EscrowData {
  randomSeed: number;
  initializerKey: PublicKey;
  initializerDepositTokenAccount: PublicKey;
  initializerAmount: Array<number>;
  resolver: PublicKey;
  admin2: PublicKey;
  admin2TokenAccount: PublicKey;
  admin1: PublicKey;
  admin1TokenAccount: PublicKey;
  resolverTokenAccount: PublicKey;
  takerTokenAccount: PublicKey;
  pubkey: PublicKey;
  active: boolean;
  index: number;
}

export interface AdminData {
  adminFee: number;
  resolverFee: number;
  admin1TokenAccount: PublicKey;
  admin2TokenAccount: PublicKey;
}

const programID = new PublicKey(idl.metadata.address);
const { adminSeed, stateSeed, vaultSeed, authoritySeed } = constants;

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  const [faqNum, setFaqNum] = useState(0);
  const [stage, setStage] = useState(0);
  const [currentEscrow, setCurrentEscrow] = useState(0);

  const [adminData, setAdminData] = useState<AdminData>();
  const [escrowData, setEscrowData] = useState<EscrowData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [myStatus, setMyStatus] = useState("active");
  const [showModerator, setModeratorVisibility] = useState(false);

  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [description, setDescription] = useState("");
  const [receiver, setReceiver] = useState(
    "3Y3HS9Twxsm6wRcqmgDBzmz1ggD87siqDvS3FzmPBnvH"
  );
  const [moderator, setModerator] = useState(constants.moderator);
  const [amount, setAmount] = useState(0);
  const [milestone1, setMilestone1] = useState("");
  const [amount1, setAmount1] = useState(0);
  const [milestone2, setMilestone2] = useState("");
  const [amount2, setAmount2] = useState(0);
  const [milestone3, setMilestone3] = useState("");
  const [amount3, setAmount3] = useState(0);
  const [milestone4, setMilestone4] = useState("");
  const [amount4, setAmount4] = useState(0);
  const [milestone5, setMilestone5] = useState("");
  const [amount5, setAmount5] = useState(0);

  const [user] = useAtom(profile);
  const [moderators] = useAtom(profileModerators);

  const opts = {
    preflightCommitment: "processed",
  };

  useEffect(() => {
    setAmount(amount1 + amount2 + amount3 + amount4 + amount5);
  }, [amount1, amount2, amount3, amount4, amount5]);

  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_SERVER_URL}/escrows`,
    }).then(result => {
      setEscrowData(result.data);
    })
  })

  const toggleModerator = (add: string) => {
    setModerator(add);
    setModeratorVisibility(false);
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
    if (amount <= 0) {
      toast("Total amount must be greater that 0");
      return;
    }
    if (
      currentMilestone > 0 &&
      amount !== amount1 + amount2 + amount3 + amount4 + amount5
    ) {
      toast(
        "Set the milestone payment correctly. Must be matched to total amount!"
      );
      return;
    }
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const mint = new PublicKey(constants.mint);
    const receiverAddress = new PublicKey(receiver);
    const resolver = new PublicKey(moderator);

    let receiverAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      receiverAddress,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let resolverAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      resolver,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let initializerAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;
    try {
      account = await getAccountInfo(
        connection,
        receiverAssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            receiverAssiciatedToken,
            receiverAddress,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        resolverAssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            resolverAssiciatedToken,
            resolver,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        initializerAssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            initializerAssiciatedToken,
            publicKey,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    const randomSeed: anchor.BN = new anchor.BN(
      Math.floor(Math.random() * 100000000)
    );

    // Derive PDAs: escrowStateKey, vaultKey, vaultAuthorityKey
    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];
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

    let seed = randomSeed;

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.initialize(
        seed,
        currentMilestone === 0
          ? [
            new anchor.BN(amount * 1e9),
            new anchor.BN(0),
            new anchor.BN(0),
            new anchor.BN(0),
            new anchor.BN(0),
          ]
          : [
            new anchor.BN(amount1 * 1e9),
            new anchor.BN(amount2 * 1e9),
            new anchor.BN(amount3 * 1e9),
            new anchor.BN(amount4 * 1e9),
            new anchor.BN(amount5 * 1e9),
          ],
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            vault: vaultKey,
            adminState: adminKey,
            resolverTokenAccount: resolverAssiciatedToken,
            mint,
            initializerDepositTokenAccount: initializerAssiciatedToken,
            takerTokenAccount: receiverAssiciatedToken,
            escrowState: escrowStateKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setStage(0);

      const milestones = {
        milestone1: {
          mileston: milestone1,
          amount: amount1
        },
        milestone2: {
          mileston: milestone2,
          amount: amount2
        },
        milestone3: {
          mileston: milestone3,
          amount: amount3
        },
        milestone4: {
          mileston: milestone4,
          amount: amount4
        },
        milestone5: {
          mileston: milestone5,
          amount: amount5
        }
      }

      axios({
        method: "post",
        url: `${process.env.REACT_APP_SERVER_URL}/escrows`,
        data: {
          description: description,
          seed: seed,
          receiver: receiverAddress,
          moderator: moderator,
          amount: amount,
          milestones: JSON.stringify(milestones)
        }
      })

    } catch (err) {
      // console.log(err.message);
      console.log(err);

      axios({
        method: "delete",
        url: `${process.env.REACT_APP_SERVER_URL}/escrows/${seed}`,
      })
    }
  };

  const getEscrow = async () => {
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);
    try {
      const adminKey = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
          Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
        ],
        program.programId
      )[0];
      let tmpLockedval = 0;
      await Promise.all(
        (
          await connection.getProgramAccounts(programID)
        ).map(
          async (
            tx,
            index //no need to write smartcontract to get the data, just pulling all transaction respective programID and showing to user
          ) => {
            if (tx.pubkey.toString() === adminKey.toString()) {
              const fetchData: any = await program.account.adminState.fetch(
                tx.pubkey
              );
              const newData = {
                ...fetchData,
                adminFee: Number(fetchData.adminFee),
                resolverFee: Number(fetchData.resolverFee),
              };
              setAdminData(newData);
              return true;
            }
            const fetchData: any = await program.account.escrowState.fetch(
              tx.pubkey
            );
            const newData = {
              ...fetchData,
              initializerAmount: [
                Number(fetchData.initializerAmount[0] / 1e9),
                Number(fetchData.initializerAmount[1] / 1e9),
                Number(fetchData.initializerAmount[2] / 1e9),
                Number(fetchData.initializerAmount[3] / 1e9),
                Number(fetchData.initializerAmount[4] / 1e9),
              ],
              randomSeed: Number(fetchData.randomSeed),
            };
            const lockedVal =
              newData.initializerAmount[0] +
              newData.initializerAmount[1] +
              newData.initializerAmount[2] +
              newData.initializerAmount[3] +
              newData.initializerAmount[4];
            tmpLockedval += lockedVal;
            return {
              ...newData,
              pubkey: tx.pubkey.toString(),
              active: lockedVal > 0 ? true : false,
            };
          }
        )
      ).then((tmpResult) => {
        tmpResult.splice(tmpResult.indexOf(true), 1);
        const result = tmpResult.map((escr, idx) => {
          return { ...escr, index: idx };
        });
        setTotalValue(tmpLockedval);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const approvePayment = async () => {
    console.log(currentEscrow);
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];

    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultAuthorityKey = PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode(authoritySeed))],
      program.programId
    )[0];

    console.log({
      initializer: provider.wallet.publicKey.toString(),
      adminState: adminKey.toString(),
      resolverTokenAccount:
        escrowData[currentEscrow].resolverTokenAccount.toString(),
      admin1TokenAccount:
        escrowData[currentEscrow].admin1TokenAccount.toString(),
      admin2TokenAccount:
        escrowData[currentEscrow].admin2TokenAccount.toString(),
      initializerDepositTokenAccount:
        escrowData[currentEscrow].initializerDepositTokenAccount.toString(),
      takerTokenAccount: escrowData[currentEscrow].takerTokenAccount.toString(),
      vault: vaultKey.toString(),
      vaultAuthority: vaultAuthorityKey.toString(),
      escrowState: escrowStateKey.toString(),
      tokenProgram: TOKEN_PROGRAM_ID.toString(),
    });

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.approve(
        new anchor.BN(selectedMilestone),
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            adminState: adminKey,
            resolverTokenAccount:
              escrowData[currentEscrow].resolverTokenAccount,
            admin1TokenAccount: escrowData[currentEscrow].admin1TokenAccount,
            admin2TokenAccount: escrowData[currentEscrow].admin2TokenAccount,
            initializerDepositTokenAccount:
              escrowData[currentEscrow].initializerDepositTokenAccount,
            takerTokenAccount: escrowData[currentEscrow].takerTokenAccount,
            vault: vaultKey,
            vaultAuthority: vaultAuthorityKey,
            escrowState: escrowStateKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      tx.feePayer = provider.wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signedTx = await provider.wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setSelectedMilestone(0);
    } catch (err) {
      // console.log(err.message);
      console.log(err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (stage === 0) getEscrow();
  }, [wallet, publicKey, signTransaction, signAllTransactions, stage]);

  return publicKey ? (
    <div className="min-h-[100vh] sm:px-[49px] px-[20px]">
      {stage === 0 && (
        <div>
          <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
            Dashboard
          </div>
          <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
            Overview of your escrows and performance.
          </div>
          <div className="mt-[35px] grid md:grid-cols-3 grid-cols-1 gap-4">
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor py-[23px] xl:px-[50px] px-[20px]">
              <div className="flex items-center">
                <div className="bg-icon1 bg-cover w-[40px] h-[40px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Profile Score
                </div>
              </div>
            </div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor p-[23px]">
              <div className="flex items-center">
                <div className="bg-icon2 bg-cover w-[40px] h-[40px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Feedback
                </div>
              </div>
            </div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor p-[23px]">
              <div className="flex items-center">
                <div className="bg-icon3 bg-cover w-[40px] h-[40px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Escrow Status
                </div>
              </div>
              <div className="mt-[20px]">
                <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                  <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                    In Escrow
                  </div>
                  <div className="text-[20px] leading-[23px] font-[800]">
                    {totalValue}
                  </div>
                </div>
                <div className="mt-[28px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                  <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                    Active
                  </div>
                  <div className="text-[20px] leading-[23px] font-[800]">
                    {
                      escrowData.filter((escrow) => {
                        return escrow.active === true;
                      }).length
                    }
                  </div>
                </div>
                <div className="mt-[28px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                  <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                    Completed
                  </div>
                  <div className="text-[20px] leading-[23px] font-[800]">
                    {
                      escrowData.filter((escrow) => {
                        return escrow.active === false;
                      }).length
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[51px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
          <div className="mt-[35px] flex justify-between sm:items-center sm:flex-row w-full flex-wrap">
            <div className="flex items-center mr-[20px] mb-[1rem]">
              <div className="font-[600] text-[22px] leading-[26px]">
                My Escrows
              </div>
              <div
                className="ml-[32px] rounded-[10px] w-[115px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor font-[600] text-[18px] leading-[21px] cursor-pointer"
                onClick={() => {
                  if (wallet) {
                    setStage(1);
                  } else toast("Please connect wallet");
                }}
              >
                CREATE
              </div>
            </div>
            <div className="rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[246px] h-[42px] p-[3px] flex justify-between sm:items-center sm:flex-row mb-[1rem]">
              <div
                className={
                  myStatus === "active"
                    ? "w-[115.69px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setMyStatus("active")}
              >
                Active
              </div>
              <div
                className={
                  myStatus === "completed"
                    ? "w-[115.69px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setMyStatus("completed")}
              >
                Completed
              </div>
            </div>
          </div>
          <div className="mt-[46px] pb-[177px] grid md:grid-cols-3 grid-cols-1 gap-4">
            {escrowData
              .filter((escrow) => {
                if (myStatus === "active")
                  return (
                    escrow.initializerKey.toString() === publicKey.toString() &&
                    escrow.active === true
                  );
                if (myStatus === "completed")
                  return (
                    escrow.initializerKey.toString() === publicKey.toString() &&
                    escrow.active === false
                  );
              })
              .map((myEscrow, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-[10px] bg-dashboard-card2-bgcolor"
                  >
                    <div
                      className={
                        idx % 3 === 0
                          ? `bg-dashboard-card2-interior1-bgcolor p-[23px] rounded-[10px]`
                          : `bg-dashboard-card2-interior2-bgcolor p-[23px] rounded-[10px]`
                      }
                    >
                      <div className="flex items-center">
                        <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />
                        <div className="ml-[14px]">
                          <div className="text-[#ADADAD] font-[300] text-[10px] leading-[12px]">{`Escrow #${myEscrow.randomSeed}`}</div>
                          <div className="font-[500] text-[20px] leading-[23px]">
                            Escrow Status
                          </div>
                        </div>
                      </div>
                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Amount
                          </div>
                          <div className="text-[20px] leading-[23px] font-[800]">
                            {`$ ${myEscrow.initializerAmount[0] +
                              myEscrow.initializerAmount[1] +
                              myEscrow.initializerAmount[2] +
                              myEscrow.initializerAmount[3] +
                              myEscrow.initializerAmount[4]
                              }`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Status
                          </div>
                          <div className="text-[20px] leading-[23px] font-[800]">
                            {myEscrow.active ? "In progress" : "Completed"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex flex-row-reverse py-[12px] px-[23px] items-center cursor-pointer"
                      onClick={() => {
                        console.log("myEscrow.index", myEscrow.index);
                        setCurrentEscrow(myEscrow.index);
                        setStage(2);
                      }}
                    >
                      <div className="bg-link bg-cover w-[12px] h-[12px] cursor-pointer" />
                      <div className="font-[500] text-[16px] leading-[19px] mr-[10px]">
                        View Escrow
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {stage === 1 && (
        <div className="pb-[249px]">
          <div className="flex items-center">
            <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
              Create Escrow
            </div>
          </div>
          <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
            Create a new escrow and protect your payments.
          </div>
          <div className="mt-[35px] grid grid-cols-1 lg:grid-cols-2 gap-[5rem]">
            <div className="pt-[23px]">
              <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                  Description
                </div>
                <input
                  type="text"
                  className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                  Receiver
                </div>
                <input
                  type="text"
                  className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                />
              </div>
              <div className="mt-[50px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                  Moderator
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                    value={moderator}
                    onChange={(e) => setModerator(e.target.value)}
                  />

                  {showModerator ? (
                    <ul className="absolute w-full bg-primary rounded-b-[5px] mt-[1px] border-[#7C98A9]">
                      {moderators.map((item, index) => (
                        <li
                          key={`mod-${index}`}
                          className="w-full cursor-pointer py-[.5rem] px-[.5rem] overflow-hidden truncate hover:bg-primary bg-dark"
                          onClick={() => toggleModerator(item.walletAddress)}
                        >
                          {item.walletAddress}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    ""
                  )}

                  <div
                    className="moderator-toggle cursor-pointer absolute right-0 top-0 h-full w-[2rem]"
                    onClick={() => {
                      setModeratorVisibility(!showModerator);
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-[50px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                  Amount
                </div>
                <input
                  type="text"
                  className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div className="mt-[104.37px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
            </div>
            <div className="rounded-[10px] bg-fee-panel-bgcolor p-[23px] px-[43px] hidden lg:block">
              <div className="font-[800] text-[32px] leading-[38px]">Fees</div>
              <div className="mt-[43px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="text-[20px] leading-[23px">
                  Platform fee {`(${adminData?.adminFee}%)`}
                </div>
                {adminData && (
                  <div className="text-[20px] font-[600]">
                    {`${(amount * adminData?.adminFee) / 100}`} USDC
                  </div>
                )}
              </div>
              <div className="mt-[37px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="text-[20px] leading-[23px">
                  Moderator Fee {`(${adminData?.resolverFee}%)`}
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount * adminData?.resolverFee) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-[41px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
              <div className="mt-[25px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="text-[20px] leading-[23px">
                  Receiver will get
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount *
                        (100 -
                          adminData?.resolverFee -
                          adminData?.adminFee)) /
                        100
                        }`}{" "}
                      USDC
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[47px] grid lg:grid-cols-2 grid-cols-1 gap-[5rem]">
            <div className="pr-[23px]">
              <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                  Milestones
                </div>
                <div className="flex flex-wrap">
                  <div
                    className="w-[110px] h-[40px] mr-[30px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem]"
                    onClick={() => {
                      if (currentMilestone < 5)
                        setCurrentMilestone(currentMilestone + 1);
                      else toast("Max milestone number is 5");
                    }}
                  >
                    ADD +
                  </div>
                  <div
                    className="w-[110px] h-[40px] mr-[80px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem]"
                    onClick={() => setCurrentMilestone(0)}
                  >
                    Reset
                  </div>
                </div>
              </div>
              {currentMilestone > 0 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Milestone 1
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={milestone1}
                      onChange={(e) => setMilestone1(e.target.value)}
                    />
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={amount1}
                      onChange={(e) => setAmount1(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {currentMilestone > 1 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Milestone 2
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={milestone2}
                      onChange={(e) => setMilestone2(e.target.value)}
                    />
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={amount2}
                      onChange={(e) => setAmount2(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {currentMilestone > 2 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Milestone 3
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={milestone3}
                      onChange={(e) => setMilestone3(e.target.value)}
                    />
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={amount3}
                      onChange={(e) => setAmount3(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {currentMilestone > 3 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Milestone 4
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={milestone4}
                      onChange={(e) => setMilestone4(e.target.value)}
                    />
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={amount4}
                      onChange={(e) => setAmount4(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {currentMilestone > 4 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Milestone 5
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={milestone5}
                      onChange={(e) => setMilestone5(e.target.value)}
                    />
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <input
                      type="text"
                      className="w-[330px] max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={amount5}
                      onChange={(e) => setAmount5(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-row">
              <div
                className="w-[120px] h-[40px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer"
                onClick={createEscrow}
              >
                CREATE
              </div>
              <div
                className="ml-[30px] w-[120px] h-[40px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer"
                onClick={() => {
                  setStage(0);
                }}
              >
                CANCEL
              </div>
            </div>
          </div>
        </div>
      )}
      {stage === 2 && (
        <div className="mb-[150px]">
          <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
            Artist Payment
          </div>
          <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
            Escrow # {escrowData[currentEscrow].randomSeed}
          </div>
          <div className="mt-[20px] w-[386px]">
            {escrowData[currentEscrow].initializerAmount.map(
              (milestone, idx) => {
                return (
                  <div
                    key={idx}
                    className="mt-[20px] flex items-center"
                    onClick={() => {
                      setSelectedMilestone(idx);
                    }}
                  >
                    <div className="flex justify-center items-center rounded-[40px] w-[40px] h-[40px] bg-milestone-index1-bgcolor text-[20px] font-[800]">
                      {idx + 1}
                    </div>
                    <div
                      className={
                        idx === selectedMilestone
                          ? "ml-[14px] w-[450px] rounded-[10px] bg-milestone-index2-bgcolor p-[23px] cursor-pointer"
                          : "ml-[14px] w-[450px] rounded-[10px] bg-milestone-index1-bgcolor p-[23px] cursor-pointer"
                      }
                    >
                      <div className="flex items-center">
                        <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />{" "}
                        <div className="ml-[13px] text-[20px] leading-[23px] font-[400]">
                          {`Milestone ${idx + 1}`}
                        </div>
                      </div>
                      <div className="mt-[15px] break-all text-[#ADADAD]">
                        Caslfkei afei afewofla owenwwa acoewacnakdfewao afoewcea
                        Caslfkei afei afewofla owenwwa acoewacnakdfewao afoewcea
                        Caslfkei afei afewofla owenwwa acoewacnakdfewao afoewcea
                      </div>
                      <div className="mt-[15px]">
                        <div className="flex justify-between items-center">
                          <div>Amount: </div>
                          <div className="text-[#21c55b]">
                            {escrowData[currentEscrow].initializerAmount[
                              idx
                            ] === 0
                              ? "Completed"
                              : "On Progress"}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>Status: </div>
                          <div className="text-[#f1102f]">
                            {escrowData[currentEscrow].initializerAmount[
                              idx
                            ] === 0
                              ? "Completed"
                              : "On Progress"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
            <div className="mt-[40px] flex justify-between items-center">
              <div
                className="w-[163px] h-[40px] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer"
                onClick={() => approvePayment()}
              >
                Accept
              </div>
              <div
                className="w-[163px] h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer"
                onClick={() => setStage(0)}
              >
                Return
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="min-h-[100vh] sm:px-[49px] px-[20px]"></div>
  );
};
export default Home;
