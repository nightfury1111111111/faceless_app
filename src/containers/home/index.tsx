import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import Reveal from "react-awesome-reveal";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAccount,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import date from "date-and-time";

import { getOrCreateAssociatedTokenAccount } from "../../utils/transferSpl/getOrCreateAssociatedTokenAccount";
import { getAssociatedTokenAddress } from "../../utils/transferSpl/getAssociatedTokerAddress";
import { getAccountInfo } from "../../utils/transferSpl/getAccountInfo";
import { createAssociatedTokenAccountInstruction } from "../../utils/transferSpl/createAssociatedTokenAccountInstruction";

import { Idl, seed } from "@project-serum/anchor/dist/cjs/idl";
import React, { Component, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PublicKey, Transaction } from "@solana/web3.js";
import Footer from "../../components/footer";
import idl from "../../idl.json";

import { constants } from "../../constants";
import { shortenAddress, validateAddress } from "../../utils/general";
import { useAtom } from "jotai";
import {
  dashboardStage,
  isLoadingOverlay,
  profile,
  profileModerators,
} from "../../utils/store";
import axios from "axios";
import { async } from "q";
import { fadeInRightShorter } from "../../utils/keyframes";
import { off } from "process";

export interface EscrowData {
  randomSeed: number;
  disputeStatus: boolean;
  initializerKey: PublicKey;
  initializerAmount: Array<number>;
  taker: PublicKey;
  mint: PublicKey;
  pubkey: PublicKey;
  active: boolean;
  index: number;
  offchainData: any;
}

export interface AdminData {
  adminFee: number;
  resolverFee: number;
  admin1: PublicKey;
  admin2: PublicKey;
  resolver: PublicKey;
  totalAmount: number;
  lockedAmount: number;
  activeEscrow: number;
  completedEscrow: number;
  disputedEscrow: number;
  refundedEscrow: number;
}

const programID = new PublicKey(idl.metadata.address);
const { adminSeed, stateSeed, vaultSeed, authoritySeed } = constants;

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  const [myTokenAddress, setMyTokenAddress] = useState("");
  const [faqNum, setFaqNum] = useState(0);
  const [stage, setStage] = useAtom(dashboardStage);
  const [currentEscrow, setCurrentEscrow] = useState(0);

  const [adminData, setAdminData] = useState<AdminData>();
  const [escrowData, setEscrowData] = useState<EscrowData[]>([]);
  const [escrowRestData, setEscrowRestData] = useState<any>({});
  const [escrowOffchainData, setEscrowOffchainData] = useState();
  const [totalValue, setTotalValue] = useState(0);
  const [entireVal, setEntireVal] = useState(0);
  const [myStatus, setMyStatus] = useState("active");
  const [forMeStatus, setForMeStatus] = useState("created");
  const [showMilestone, setMilestoneVisibility] = useState(false);
  const [useModerator, setUseModerator] = useState(true);

  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [description, setDescription] = useState("");
  const [receiver, setReceiver] = useState("");
  const [moderator, setModerator] = useState("");
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

  //define error
  const [descriptionErr, setDescriptionErr] = useState("");
  const [receiverErr, setReceiverErr] = useState("");
  const [amountErr, setAmountErr] = useState("");
  const [milestone1Err, setMilestone1Err] = useState("");
  const [amount1Err, setAmount1Err] = useState("");
  const [milestone2Err, setMilestone2Err] = useState("");
  const [amount2Err, setAmount2Err] = useState("");
  const [milestone3Err, setMilestone3Err] = useState("");
  const [amount3Err, setAmount3Err] = useState("");
  const [milestone4Err, setMilestone4Err] = useState("");
  const [amount4Err, setAmount4Err] = useState("");
  const [milestone5Err, setMilestone5Err] = useState("");
  const [amount5Err, setAmount5Err] = useState("");

  const [user] = useAtom(profile);
  const [moderators] = useAtom(profileModerators);
  const [isLoading, setLoading] = useAtom(isLoadingOverlay);
  const [isWalletConnected, setWalletConnected] = useState(false);

  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const opts = {
    preflightCommitment: "processed",
  };

  // useEffect(() => {
  //   setAmount(
  //     Number(amount1) +
  //       Number(amount2) +
  //       Number(amount3) +
  //       Number(amount4) +
  //       Number(amount5)
  //   );
  // }, [amount1, amount2, amount3, amount4, amount5]);

  useEffect(() => {
    setTimeout(() => {
      setWalletConnected(true);
    }, 200);
  }, [publicKey]);

  const getEscrowDate = (seed: number) => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_SERVER_URL}/escrows/${seed}`,
    }).then((result) => {
      let createdDate = date.format(
        new Date(result.data.created_at),
        "YYYY/MM/DD HH:mm:ss"
      );
      setEscrowRestData({
        ...result.data,
        date: createdDate,
      });
      if (forMeStatus === "created") setStage(2);
      if (forMeStatus === "received") setStage(3);
    });
  };

  const resetMilestone = () => {
    setCurrentMilestone(0);
    setMilestone1("");
    setAmount1(0);
    setMilestone2("");
    setAmount2(0);
    setMilestone3("");
    setAmount3(0);
    setMilestone4("");
    setAmount4(0);
    setMilestone5("");
    setAmount5(0);
  };

  const resetError = () => {
    setDescriptionErr("");
    setReceiverErr("");
    setAmountErr("");
    setMilestone1Err("");
    setAmount1Err("");
    setMilestone2Err("");
    setAmount2Err("");
    setMilestone3Err("");
    setAmount3Err("");
    setMilestone4Err("");
    setAmount4Err("");
    setMilestone5Err("");
    setAmount5Err("");
  };

  const inputNumberAmount = (val: any, func: Function) => {
    if (!val || val == 0) setAmount(0);

    func(val.toString().replace(/^0+/, ""));
  };

  const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const toggleModerator = (add: string) => {
    setModerator(add);
    setMilestoneVisibility(false);
  };

  const toggleMyStatus = () => {
    if (myStatus === "completed") setMyStatus("active");
    if (myStatus === "active") setMyStatus("completed");
  };

  const toggleChecked = () => {
    setCheckedAll(!checkedAll);
  };

  const isValidEscrow = () => {
    let status = true;
    if (
      currentMilestone > 0 &&
      Number(amount) !==
        Number(amount1) +
          Number(amount2) +
          Number(amount3) +
          Number(amount4) +
          Number(amount5)
    ) {
      setAmountErr("Must be matched to total amount of milestones!");
      status = false;
    }
    if (!validateAddress(receiver)) {
      setReceiverErr("Invalid address");
      status = false;
    }
    if (description == "") {
      setDescriptionErr("Name is required");
      status = false;
    } else setDescriptionErr("");
    if (receiver == "") {
      setReceiverErr("Receiver is required");
      status = false;
    }
    if (amount == 0) {
      setAmountErr("Amount is required");
      status = false;
    }
    if (currentMilestone > 0) {
      if (milestone1 == "") {
        setMilestone1Err("Milestone name is required");
        status = false;
      } else setMilestone1Err("");
      if (amount1 == 0) {
        setAmount1Err("Amount is required");
        status = false;
      } else setAmount1Err("");
    }
    if (currentMilestone > 1) {
      if (milestone2 == "") {
        setMilestone2Err("Milestone name is required");
        status = false;
      } else setMilestone2Err("");
      if (amount2 == 0) {
        setAmount2Err("Amount is required");
        status = false;
      } else setAmount2Err("");
    }
    if (currentMilestone > 2) {
      if (milestone3 == "") {
        setMilestone3Err("Milestone name is required");
        status = false;
      } else setMilestone3Err("");
      if (amount3 == 0) {
        setAmount3Err("Amount is required");
        status = false;
      } else setAmount3Err("");
    }
    if (currentMilestone > 3) {
      if (milestone4 == "") {
        setMilestone4Err("Milestone name is required");
        status = false;
      } else setMilestone4Err("");
      if (amount4 == 0) {
        setAmount4Err("Amount is required");
        status = false;
      } else setAmount4Err("");
    }
    if (currentMilestone > 4) {
      if (milestone5 == "") {
        setMilestone5Err("Milestone name is required");
        status = false;
      } else setMilestone5Err("");
      if (amount5 == 0) {
        setAmount5Err("Amount is required");
        status = false;
      } else setAmount5Err("");
    }
    if (!checkedAll) status = false;
    return status;
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
    if (isLoading1) return;
    if (!isValidEscrow()) return;
    resetError();
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const mint = new PublicKey(constants.mint);
    const receiverAddress = new PublicKey(receiver);
    // const resolver = new PublicKey(useModerator ? moderator : receiverAddress);

    // let receiverAssiciatedToken = await getAssociatedTokenAddress(
    //   mint,
    //   receiverAddress,
    //   false,
    //   TOKEN_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    // let resolverAssiciatedToken = await getAssociatedTokenAddress(
    //   mint,
    //   resolver,
    //   false,
    //   TOKEN_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    let initializerAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;
    // try {
    //   account = await getAccountInfo(
    //     connection,
    //     receiverAssiciatedToken,
    //     undefined,
    //     TOKEN_PROGRAM_ID
    //   );
    // } catch (error: any) {
    //   if (
    //     error.message === "TokenAccountNotFoundError" ||
    //     error.message === "TokenInvalidAccountOwnerError"
    //   ) {
    //     transaction.add(
    //       createAssociatedTokenAccountInstruction(
    //         publicKey,
    //         receiverAssiciatedToken,
    //         receiverAddress,
    //         mint,
    //         TOKEN_PROGRAM_ID,
    //         ASSOCIATED_TOKEN_PROGRAM_ID
    //       )
    //     );
    //   }
    // }

    // try {
    //   account = await getAccountInfo(
    //     connection,
    //     resolverAssiciatedToken,
    //     undefined,
    //     TOKEN_PROGRAM_ID
    //   );
    // } catch (error: any) {
    //   if (
    //     error.message === "TokenAccountNotFoundError" ||
    //     error.message === "TokenInvalidAccountOwnerError"
    //   ) {
    //     transaction.add(
    //       createAssociatedTokenAccountInstruction(
    //         publicKey,
    //         resolverAssiciatedToken,
    //         resolver,
    //         mint,
    //         TOKEN_PROGRAM_ID,
    //         ASSOCIATED_TOKEN_PROGRAM_ID
    //       )
    //     );
    //   }
    // }

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

    // save info to backend
    const milestones =
      currentMilestone === 0
        ? [
            {
              mileston: description,
              amount: amount,
            },
          ]
        : [
            {
              mileston: milestone1,
              amount: amount1,
            },
            {
              mileston: milestone2,
              amount: amount2,
            },
            {
              mileston: milestone3,
              amount: amount3,
            },
            {
              mileston: milestone4,
              amount: amount4,
            },
            {
              mileston: milestone5,
              amount: amount5,
            },
          ];

    axios({
      method: "post",
      url: `${process.env.REACT_APP_SERVER_URL}/escrows`,
      data: {
        description: description,
        seed: seed.toString(10),
        receiver: receiverAddress,
        moderator: receiverAddress, // ignore
        amount: amount,
        milestones: milestones,
      },
    });

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana

      const tx = await program.transaction.initialize(
        seed,
        currentMilestone === 0
          ? [
              new anchor.BN(amount * 1e6),
              new anchor.BN(0),
              new anchor.BN(0),
              new anchor.BN(0),
              new anchor.BN(0),
            ]
          : [
              new anchor.BN(amount1 * 1e6),
              new anchor.BN(amount2 * 1e6),
              new anchor.BN(amount3 * 1e6),
              new anchor.BN(amount4 * 1e6),
              new anchor.BN(amount5 * 1e6),
            ],
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            vault: vaultKey,
            adminState: adminKey,
            // resolverTokenAccount: resolverAssiciatedToken,
            mint,
            initializerDepositTokenAccount: initializerAssiciatedToken,
            taker: receiverAddress,
            // takerTokenAccount: receiverAssiciatedToken,
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
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      toast("Escrow created successfully.");
      setCheckedAll(false);
      setStage(0);

      //reset data
      setDescription("");
      setReceiver("");
      setAmount(0);
      resetMilestone();
    } catch (err) {
      console.log(err);
      setIsLoading1(false);
      toast("Action failed. Try again");

      axios({
        method: "delete",
        url: `${process.env.REACT_APP_SERVER_URL}/escrows/${seed}`,
      });
    }
  };

  const getEscrow = async () => {
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);
    const mint = new PublicKey(constants.mint);
    let myAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    setMyTokenAddress(myAssiciatedToken.toString());
    try {
      const adminKey = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
          Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
        ],
        program.programId
      )[0];

      const fetchData: any = await program.account.adminState.fetch(adminKey);
      console.log(fetchData);
      const newData = {
        ...fetchData,
        adminFee: Number(fetchData.adminFee),
        resolverFee: Number(fetchData.resolverFee),
        totalAmount: Number(fetchData.totalAmount),
        lockedAmount: Number(fetchData.lockedAmount),
        activeEscrow: Number(fetchData.activeEscrow),
        completedEscrow: Number(fetchData.completedEscrow),
        disputedEscrow: Number(fetchData.disputedEscrow),
        refundedEscrow: Number(fetchData.refundedEscrow),
      };
      console.log("admin data", newData);
      setAdminData(newData);

      let tmpLockedval = 0;
      let tmpEntireVal = 0;
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
              console.log("admin data", newData);
              setAdminData(newData);
              return true;
            }
            const fetchData: any = await program.account.escrowState.fetch(
              tx.pubkey
            );
            let offchainData;
            try {
              offchainData = await axios({
                method: "get",
                url: `${process.env.REACT_APP_SERVER_URL}/escrows/${Number(
                  fetchData.randomSeed
                )}`,
              });
            } catch (err) {
              // toast("Server Error");
              return true;
            }
            const newData = {
              ...fetchData,
              initializerAmount: [
                Number(fetchData.initializerAmount[0] / 1e6),
                Number(fetchData.initializerAmount[1] / 1e6),
                Number(fetchData.initializerAmount[2] / 1e6),
                Number(fetchData.initializerAmount[3] / 1e6),
                Number(fetchData.initializerAmount[4] / 1e6),
              ],
              randomSeed: Number(fetchData.randomSeed),
              offchainData: offchainData.data,
            };
            const lockedVal =
              newData.initializerAmount[0] +
              newData.initializerAmount[1] +
              newData.initializerAmount[2] +
              newData.initializerAmount[3] +
              newData.initializerAmount[4];
            tmpLockedval += lockedVal;
            offchainData.data.milestones.map((val: any) => {
              tmpEntireVal += val.amount;
              return true;
            });

            return {
              ...newData,
              pubkey: tx.pubkey.toString(),
              active: lockedVal > 0 ? true : false,
            };
          }
        )
      ).then((tmpResult) => {
        const result = tmpResult
          .reduce(
            (result, item) => (item === true ? result : [...result, item]),
            []
          )
          .map((escr: any, idx: number) => {
            return { ...escr, index: idx };
          });
        result.sort((a: any, b: any) => {
          return b.offchainData.created_at - a.offchainData.created_at;
        });
        setTotalValue(tmpLockedval);
        setEntireVal(tmpEntireVal);
        setEscrowData(result);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const approvePayment = async () => {
    if (isLoading1) return;
    if (!adminData) return;
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

    let takerAssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      escrowData[currentEscrow].taker,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin1AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin1,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin2AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin2,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;

    try {
      account = await getAccountInfo(
        connection,
        takerAssiciatedToken,
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
            takerAssiciatedToken,
            escrowData[currentEscrow].taker,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        admin1AssiciatedToken,
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
            admin1AssiciatedToken,
            adminData.admin1,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        admin2AssiciatedToken,
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
            admin2AssiciatedToken,
            adminData.admin2,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }
    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.approve(
        new anchor.BN(selectedMilestone),
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            adminState: adminKey,
            admin1TokenAccount: admin1AssiciatedToken,
            admin2TokenAccount: admin2AssiciatedToken,
            takerTokenAccount: takerAssiciatedToken,
            vault: vaultKey,
            vaultAuthority: vaultAuthorityKey,
            escrowState: escrowStateKey,
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
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      if (currentIdx === 1)
        toast(
          "Thank you for using Faceless Labs. You have completed the escrow"
        );
      else toast("Payment sent successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      setIsLoading1(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  const refundPayment = async () => {
    if (isLoading1) return;
    if (!adminData) return;
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

    let initializerAssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      escrowData[currentEscrow].initializerKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin1AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin1,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin2AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin2,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.refund({
        accounts: {
          taker: provider.wallet.publicKey,
          adminState: adminKey,
          admin1TokenAccount: admin1AssiciatedToken,
          admin2TokenAccount: admin2AssiciatedToken,
          initializerDepositTokenAccount: initializerAssiciatedToken,
          vault: vaultKey,
          vaultAuthority: vaultAuthorityKey,
          escrowState: escrowStateKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [],
      });
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      toast("Sent payment to creator successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      setIsLoading1(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  const dispute = async () => {
    if (isLoading2) return;
    if (!adminData) return;
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

    const transaction = new Transaction();
    let account;

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.dispute({
        accounts: {
          disputor: provider.wallet.publicKey,
          adminState: adminKey,
          escrowState: escrowStateKey,
        },
        signers: [],
      });
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading2(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading2(false);
      toast("Disputed successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      setIsLoading2(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  useEffect(() => {
    if (stage === 0) getEscrow();
    if (stage === 1) resetError();
  }, [wallet, publicKey, signTransaction, signAllTransactions, stage]);

  return !isWalletConnected || !publicKey ? (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center font-['Gagalin']">
      <div className="bg-new-splash bg-cover w-[70vw] md:w-[30vw] h-[calc(70vw*2262/3056)] md:h-[calc(30vw*2262/3056)]"></div>
      {/* <img
        src="/images/splash.png"
        width={1920}
        height={1080}
        alt="splash"
        className="w-[100vw] h-[100vh] fixed object-cover"
      ></img> */}

      <div className="fixed bottom-[20px] left-0 w-full">
        <div className="text-[12px] leading-[21px] text-center">
          © {new Date().getFullYear()} Faceless Labs
        </div>
        <div className="text-[12px] leading-[21px] text-center">
          #THEMISFITS
        </div>
        <div className="mt-[14px] flex justify-center">
          <a
            className="w-[20px] h-[20px] bg-discord bg-cover cursor-pointer hover:brightness-50"
            href={"https://discord.com/invite/HRhdNPhB2A"}
            target="_blank"
            rel="noreferrer"
          ></a>
          <a
            className="ml-[24px] w-[20px] h-[20px] bg-twitter bg-cover cursor-pointer hover:brightness-50"
            href={"https://twitter.com/facelesslabsnft"}
            target="_blank"
            rel="noreferrer"
          ></a>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[100vh] px-[15px] sm:px-[40px] lg:px-[100px] pb-[20px]">
      {stage === 0 && (
        <div>
          <div className="md:text-[44px] text-[30px] pt-[185px] font-[700] text-center">
            Welcome To <span className="text-[#017CE9]">Faceless Labs</span>{" "}
            Escrow Platform
          </div>
          <div className="mt-[14px] md:text-[24px] text-[16px] leading-[21px] font-[300] text-center">
            Create secure and seamless{" "}
            <span className="font-[600]">transactions</span> using our trusted{" "}
            <span className="font-[600]">escrow </span>
            services.
          </div>
          <div className="md:mt-0 my-[30px] md:h-[204px] flex flex-col md:flex-row justify-center items-center">
            <div className="flex flex-col items-center font-[600] px-[40px] md:border-r-[3px] border-r-[#1e1e22]">
              <div className="text-[#747474] md:text-[20px] text-[16px]">
                ALL TIME VOLUME
              </div>
              <div className="text-[#ffffff] md:text-[26px] text-[20px] flex items-center">
                {numberWithCommas(entireVal)}
                <div className="ml-[5px] md:w-[30px] md:h-[30px] w-[24px] h-[24px] bg-usdc bg-cover"></div>
              </div>
            </div>
            <div className="md:mt-0 mt-[15px] flex flex-col items-center font-[600] px-[40px] md:border-r-[3px] border-r-[#1e1e22]">
              <div className="text-[#747474] md:text-[20px] text-[16px]">
                IN ESCROW
              </div>
              <div className="text-[#ffffff] md:text-[26px] text-[20px] flex items-center">
                {numberWithCommas(totalValue)}
                <div className="ml-[5px] md:w-[30px] md:h-[30px] w-[24px] h-[24px] bg-usdc bg-cover"></div>
              </div>
            </div>
            <div className="md:mt-0 mt-[15px] flex flex-col items-center font-[600] px-[40px]">
              <div className="text-[#747474] md:text-[20px] text-[16px]">
                ACTIVE ESCROWS
              </div>
              <div className="text-[#ffffff] md:text-[26px] text-[20px]">
                {
                  escrowData.filter((escrow) => {
                    return escrow.active === true;
                  }).length
                }
              </div>
            </div>
          </div>

          <div className="border-b-[3px] border-b-[#121217] flex justify-start items-center">
            <div className="flex items-center md:text-[18px] text-[14px] font-[600]">
              <div
                className={
                  forMeStatus === "created"
                    ? "md:w-[144px] w-[100px] md:h-[55px] h-[40px] flex justify-center items-center bg-[#121217] rounded-t-[10px] cursor-pointer"
                    : "md:w-[144px] w-[100px] md:h-[55px] h-[40px] flex justify-center items-center bg-transparent hover:bg-[#242020] rounded-t-[10px] cursor-pointer"
                }
                onClick={() => {
                  setForMeStatus("created");
                  setMyStatus("active");
                }}
              >
                Created
              </div>
              <div
                className={
                  forMeStatus === "received"
                    ? "ml-[10px] md:w-[144px] w-[100px] md:h-[55px] h-[40px] flex justify-center items-center bg-[#121217] rounded-t-[10px] cursor-pointer"
                    : "ml-[10px] md:w-[144px] w-[100px] md:h-[55px] h-[40px] flex justify-center items-center bg-transparent hover:bg-[#242020] rounded-t-[10px] cursor-pointer"
                }
                onClick={() => {
                  setForMeStatus("received");
                  setMyStatus("active");
                }}
              >
                Received
              </div>
              <div
                className="md:ml-[20px] ml-[6px] md:w-[124px] w-[90px] md:h-[41px] h-[36px] hover:bg-[#242020] rounded-[30px] border-[3px] border-[#017CE9] flex justify-center items-center md:text-[16px] text-[12px] font-[700] cursor-pointer"
                onClick={() => {
                  if (wallet) {
                    setStage(1);
                  } else toast("Please connect wallet");
                }}
              >
                + CREATE
              </div>
            </div>
          </div>

          <div className="mt-[35px] flex flex-row-reverse items-center w-full flex-wrap">
            <div className="text-[#AFAFAF] text-[14px] font-[600]">
              COMPLETED
            </div>
            <div
              className="mx-[8px] rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[40px] md:h-[20px] h-[20px] px-[3px] flex justify-between items-center sm:flex-row"
              onClick={() => toggleMyStatus()}
            >
              <div
                className={
                  myStatus === "active"
                    ? "w-[16px] md:h-[16px] h-[16px] flex justify-center items-center bg-[#017CE9] md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[16px] md:h-[16px] h-[16px] flex justify-center items-center md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
              ></div>
              <div
                className={
                  myStatus === "completed"
                    ? "w-[16px] md:h-[16px] h-[16px] flex justify-center items-center bg-[#017CE9] md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[16px] md:h-[16px] h-[16px] flex justify-center items-center md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
              ></div>
            </div>
            <div className="text-[#AFAFAF] text-[14px] font-[600]">ACTIVE</div>
          </div>
          <div className="my-[46px] pb-[60px] grid md:grid-cols-3 grid-cols-1 lg:gap-16 gap-4">
            {escrowData
              .filter((escrow) => {
                if (myStatus === "active") {
                  if (forMeStatus === "created")
                    return (
                      escrow.initializerKey.toString() ===
                        publicKey.toString() && escrow.active === true
                    );
                  if (forMeStatus === "received")
                    return (
                      escrow.taker.toString() === publicKey.toString() &&
                      escrow.active === true
                    );
                }
                if (myStatus === "completed") {
                  if (forMeStatus === "created")
                    return (
                      escrow.initializerKey.toString() ===
                        publicKey.toString() && escrow.active === false
                    );
                  if (forMeStatus === "received")
                    return (
                      escrow.taker.toString() === publicKey.toString() &&
                      escrow.active === false
                    );
                }
              })
              .map((myEscrow, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-[10px] bg-dashboard-card2-interior2-bgcolor cursor-pointer"
                    onClick={async () => {
                      console.log("myEscrow.index", myEscrow);
                      setCurrentEscrow(myEscrow.index);
                      setSelectedMilestone(0);
                      let restMilestoneNum = 0;
                      for (let idx = 0; idx < 5; idx++) {
                        console.log(idx, myEscrow.initializerAmount[idx]);
                        if (myEscrow.initializerAmount[idx] > 0) {
                          restMilestoneNum++;
                        }
                      }
                      setCurrentIdx(restMilestoneNum);
                      getEscrowDate(myEscrow.randomSeed);
                    }}
                  >
                    <div className="h-[10px] bg-dashboard-card2-interior1-bgcolor rounded-t-[10px]"></div>
                    <div
                      className={
                        myEscrow.disputeStatus
                          ? `bg-dashboard-card2-interior2-bgcolor py-[28px] px-[35px] rounded-b-[10px]`
                          : `bg-dashboard-card2-interior2-bgcolor py-[28px] px-[35px] rounded-b-[10px]`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {/* <div className="text-[#ADADAD] font-[300] text-[10px] leading-[12px]">{`Escrow #${myEscrow.randomSeed}`}</div> */}
                          <div className="flex items-center">
                            <div className="bg-icon5 bg-cover w-[20px] h-[20px]" />
                            <div className="ml-[10px] font-[500] text-[20px] leading-[23px]">
                              {myEscrow.offchainData.description}
                            </div>
                          </div>
                        </div>
                        {/* {myEscrow.disputeStatus && (
                          <div className="bg-[#ad2c44] px-[24px] py-[3px] text-[12px] rounded-[40px]">
                            Disputed
                          </div>
                        )} */}
                      </div>

                      <div className="mt-[27px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Amount
                          </div>
                          <div className="md:text-[20px] text-[18px] leading-[23px] md:font-[600] font-[400] flex items-center">
                            {numberWithCommas(
                              myEscrow.initializerAmount[0] +
                                myEscrow.initializerAmount[1] +
                                myEscrow.initializerAmount[2] +
                                myEscrow.initializerAmount[3] +
                                myEscrow.initializerAmount[4]
                            )}
                            <div className="ml-[10px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-[27px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Status
                          </div>
                          <div className="md:text-[20px] text-[18px] leading-[23px] md:font-[600] font-[400] flex items-center">
                            {myEscrow.active ? (
                              myEscrow.disputeStatus ? (
                                <span className="text-[#ffffff]">Disputed</span>
                              ) : (
                                <span className="text-[#ffffff]">
                                  In Progress
                                </span>
                              )
                            ) : (
                              <span className="text-[#ffffff]">Completed</span>
                            )}
                            {myEscrow.disputeStatus ? (
                              <div className="ml-[10px] bg-dispute bg-cover w-[18px] h-[18px]"></div>
                            ) : (
                              <div className="ml-[10px] bg-progress bg-cover w-[18px] h-[18px]"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row-reverse mt-[31px] items-center cursor-pointer">
                        <div className="bg-link bg-cover w-[12px] h-[12px] cursor-pointer" />
                        <div className="font-[500] md:text-[16px] text-[14px] leading-[19px] mr-[10px]">
                          View Escrow
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {stage === 1 && (
        <div className="pb-[249px] lg:px-[100px] text-[#FFFFFF]">
          <div className="md:text-[44px] text-[30px] pt-[185px] font-[700] text-center">
            Create a Secure <span className="text-[#017CE9]">Escrow </span>{" "}
            Payment
          </div>
          <div className="mt-[35px] grid grid-cols-1 lg:grid-cols-2 gap-x-[5rem] gap-y-8">
            <div className="flex justify-start flex-col w-full">
              <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                Escrow Name <span className="text-[#820000]">*</span>
              </div>
              <div className="relative mt-[10px]">
                <input
                  type="text"
                  className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D] focus-visible:border-[#053665]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                  {descriptionErr}
                </div>
              </div>
            </div>
            <div className="flex justify-between flex-col w-full">
              <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                Receiver Wallet <span className="text-[#820000]">*</span>
              </div>
              <div className="relative mt-[10px]">
                <input
                  type="text"
                  className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  required
                />
                <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                  {receiverErr}
                </div>
              </div>
            </div>
            {/* {useModerator ? (
                <div className="mt-[30px] flex justify-between flex-col w-full">
                  <div className="w-[180px] text-[20px] mb-[.5rem] sm:mb-0">
                    Moderator
                  </div>
                  <div className="relative mt-[10px]">
                    <input
                      type="text"
                      className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                      value={moderator}
                      onChange={(e) => setModerator(e.target.value)}
                    />

                    {showMilestone ? (
                      <ul className="absolute w-full bg-primary rounded-b-[5px] mt-[1px] border-[#053665] z-[3]">
                        {moderators.map((item, index) => (
                          <li
                            key={`mod-${index}`}
                            className="w-full cursor-pointer py-[.5rem] px-[.5rem] overflow-hidden truncate hover:bg-primary bg-dark"
                            onClick={() => toggleModerator(item._id)}
                          >
                            {item._id}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      ""
                    )}

                    <div
                      className="moderator-toggle cursor-pointer absolute right-0 top-0 h-full w-[2rem] bg-secondary text-center z-[3] border-[#053665] border-[3px] border-l-0
                     rounded-r-[5px]"
                      onClick={() => {
                        setMilestoneVisibility(!showMilestone);
                      }}
                    >
                      {showMilestone ? (
                        <i className="fa fa-angle-up"></i>
                      ) : (
                        <i className="fa fa-angle-down"></i>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )} */}
            <div className="flex justify-between flex-col w-full relative">
              <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                Payment Amount <span className="text-[#820000]">*</span>
              </div>
              <div className="relative mt-[10px]">
                <input
                  type="number"
                  className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                  value={amount}
                  placeholder="0"
                  onChange={(e) => {
                    inputNumberAmount(e.target.value, setAmount);
                  }}
                  min={0}
                  required
                />
                <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                  {amountErr}
                </div>
              </div>
              <button className="absolute right-[1px] top-[40px] md:top-[41px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                USDC{" "}
                <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                <i className="fas fa fa-angle-down" />
              </button>
            </div>

            <div className="flex justify-between flex-col w-full relative">
              <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                Milestones
              </div>
              <div className="relative mt-[10px]">
                <div className="w-[100px] h-[40px] pl-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D] flex items-center justify-between">
                  {currentMilestone}
                  <div
                    className="cursor-pointer w-[25px] h-[34px] flex items-center justify-center "
                    onClick={() => {
                      if (!showMilestone) setMilestoneVisibility(true);
                      if (showMilestone) setMilestoneVisibility(false);
                    }}
                  >
                    <i className="fas fa fa-angle-down" />
                  </div>
                </div>
                {showMilestone && (
                  <ul className="absolute w-[100px] bg-primary rounded-b-[5px] mt-[1px] border-[#053665] z-[3]">
                    {[0, 1, 2, 3, 4, 5].map((item, index) => (
                      <li
                        key={`mod-${index}`}
                        className="w-full cursor-pointer py-[.5rem] px-[.5rem] overflow-hidden truncate hover:bg-primary bg-dark"
                        onClick={() => {
                          setCurrentMilestone(item);
                          setMilestoneVisibility(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* <div
                className="w-[220px] h-[40px] mr-[0] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[600] text-[18px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem] ml-auto mt-[50px]"
                onClick={() => {
                  if (useModerator) {
                    setModerator("");
                  }
                  setUseModerator(!useModerator);
                }}
              >
                {useModerator ? "Don't need Moderator" : "Need Moderator"}
              </div> */}
          </div>
          <div className="mt-[30px] border-b-[2px] border-[#65686e] opacity-20 h-0"></div>
          <div>
            <div>
              {currentMilestone > 0 && (
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-[5rem] gap-[1rem]">
                  <div className="mt-[36px] flex justify-between flex-col w-full">
                    <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 1 <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="text"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={milestone1}
                        onChange={(e) => setMilestone1(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone1Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between flex-col w-full relative">
                    <div className="md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 1 Amount{" "}
                      <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="number"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={amount1}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount1)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount1Err}
                      </div>
                    </div>
                    <button className="absolute right-[1px] top-[40px] md:top-[47px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                      USDC{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </button>
                  </div>
                </div>
              )}
              {currentMilestone > 1 && (
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-[5rem] gap-[1rem]">
                  <div className="mt-[36px] flex justify-between flex-col w-full">
                    <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 2 <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="text"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={milestone2}
                        onChange={(e) => setMilestone2(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone2Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between flex-col w-full relative">
                    <div className="md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 2 Amount{" "}
                      <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="number"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={amount2}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount2)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount2Err}
                      </div>
                    </div>
                    <button className="absolute right-[1px] top-[40px] md:top-[47px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                      USDC{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </button>
                  </div>
                </div>
              )}
              {currentMilestone > 2 && (
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-[5rem] gap-[1rem]">
                  <div className="mt-[36px] flex justify-between flex-col w-full">
                    <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 3 <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="text"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={milestone3}
                        onChange={(e) => setMilestone3(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone3Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between flex-col w-full relative">
                    <div className="md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 3 Amount{" "}
                      <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="number"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={amount3}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount3)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount3Err}
                      </div>
                    </div>
                    <button className="absolute right-[1px] top-[40px] md:top-[47px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                      USDC{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </button>
                  </div>
                </div>
              )}
              {currentMilestone > 3 && (
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-[5rem] gap-[1rem]">
                  <div className="mt-[36px] flex justify-between flex-col w-full">
                    <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 4 <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="text"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={milestone4}
                        onChange={(e) => setMilestone4(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone4Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between flex-col w-full relative">
                    <div className="md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 4 Amount{" "}
                      <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="number"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={amount4}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount4)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount4Err}
                      </div>
                    </div>
                    <button className="absolute right-[1px] top-[40px] md:top-[47px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                      USDC{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </button>
                  </div>
                </div>
              )}
              {currentMilestone > 4 && (
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-[5rem] gap-[1rem]">
                  <div className="mt-[36px] flex justify-between flex-col w-full">
                    <div className="w-[180px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 5 <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="text"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={milestone5}
                        onChange={(e) => setMilestone5(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone5Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between flex-col w-full relative">
                    <div className="md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 5 Amount{" "}
                      <span className="text-[#820000]">*</span>
                    </div>
                    <div className="relative mt-[10px]">
                      <input
                        type="number"
                        className="w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[3px] border-[#053665] bg-[#0D0D0D]"
                        value={amount5}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount5)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount5Err}
                      </div>
                    </div>
                    <button className="absolute right-[1px] top-[40px] md:top-[47px] text-[12px] md:text-[16px] font-[400] text-white z-[2] leading-[38px] px-[10px] flex items-center  bg-transparent">
                      USDC{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-[30px] rounded-[10px] bg-fee-panel-bgcolor block md:hidden">
              <div className="h-[10px] bg-dashboard-card2-interior1-bgcolor rounded-t-[10px]"></div>
              <div className="md:py-[23px] py-[10px] md:px-[43px] px-[16px]">
                <div className="font-[600] md:text-[32px] text-[20px] leading-[38px]">
                  Fees
                </div>
                <div className="mt-[43px] flex justify-between sm:items-center w-full">
                  <div className="md:text-[20px] text-[14px] leading-[23px]">
                    Platform fee {`(${adminData?.adminFee}%)`}
                  </div>
                  {adminData && (
                    <div className="md:text-[20px] text-[14px] font-[600] flex items-center">
                      {`${(amount * adminData?.adminFee) / 100}`}{" "}
                      <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                    </div>
                  )}
                </div>
                {/* <div className="mt-[27px] flex justify-between flex-col w-full">
                <div className="text-[20px] leading-[23px">
                  Holder Discount {`(${adminData?.resolverFee}%)`}
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount * adminData?.resolverFee) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div> */}
                <div className="mt-[30px] border-b-[2px] border-[#053665] opacity-[0.4] h-0"></div>
                <div className="mt-[25px] flex justify-between sm:items-center w-full">
                  <div className="md:text-[20px] text-[14px] leading-[23px]">
                    Receiver will get
                  </div>
                  <div className="md:text-[20px] text-[14px] font-[600]">
                    {adminData && (
                      <div className="md:text-[20px] text-[14px] font-[600] flex items-center">
                        {`${(amount * (100 - adminData?.adminFee)) / 100}`}{" "}
                        <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[56px] grid lg:grid-cols-2 grid-cols-1 gap-x-[5rem]">
            <div></div>
            <div>
              <div className="rounded-[10px] bg-fee-panel-bgcolor hidden md:block">
                <div className="h-[10px] bg-dashboard-card2-interior1-bgcolor rounded-t-[10px]"></div>
                <div className="md:py-[23px] py-[10px] md:px-[43px] px-[16px]">
                  <div className="font-[600] md:text-[32px] text-[20px] leading-[38px]">
                    Fees
                  </div>
                  <div className="mt-[43px] flex justify-between sm:items-center w-full">
                    <div className="md:text-[20px] text-[14px] leading-[23px]">
                      Platform fee {`(${adminData?.adminFee}%)`}
                    </div>
                    {adminData && (
                      <div className="md:text-[20px] text-[14px] font-[600] flex items-center">
                        {`${(amount * adminData?.adminFee) / 100}`}{" "}
                        <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                      </div>
                    )}
                  </div>
                  {/* <div className="mt-[27px] flex justify-between flex-col w-full">
                <div className="text-[20px] leading-[23px">
                  Holder Discount {`(${adminData?.resolverFee}%)`}
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount * adminData?.resolverFee) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div> */}
                  <div className="mt-[30px] border-b-[2px] border-[#053665] opacity-[0.4] h-0"></div>
                  <div className="mt-[25px] flex justify-between sm:items-center w-full">
                    <div className="md:text-[20px] text-[14px] leading-[23px]">
                      Receiver will get
                    </div>
                    <div className="md:text-[20px] text-[14px] font-[600]">
                      {adminData && (
                        <div className="md:text-[20px] text-[14px] font-[600] flex items-center">
                          {`${(amount * (100 - adminData?.adminFee)) / 100}`}{" "}
                          <div className="mx-[7px] bg-usdc bg-cover w-[20px] h-[20px]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:mt-[43px] flex flex-row-reverse items-start md:text-[18px] md:leading-[20px] text-[12px]">
            <div className="h-[20px]">
              I agree that <span className="font-[700]">Faceless Labs</span>{" "}
              will get final decision over any{" "}
              <span className="font-[700]">disputes</span> that may arise.{" "}
              <span className="text-[#820000]"> * </span>
            </div>
            <input
              type="checkbox"
              className="w-[20px] h-[20px] mr-[10px]"
              onClick={() => toggleChecked()}
            />
          </div>
          <div className="mt-[43px] flex flex-row-reverse">
            <div
              className="w-[120px] md:h-[40px] h-[32px] px-[12px] rounded-[5px] bg-[#017CE9] hover:bg-transparent hover:border-[#053665] hover:border-[1px] flex justify-center items-center font-[600] md:text-[18px] text-[14px] text-[#FFFFFF] leading-[21px] cursor-pointer"
              onClick={() => {
                createEscrow();
              }}
            >
              {!isLoading1 ? (
                "CREATE"
              ) : (
                <div className="bg-loading bg-cover w-[60px] h-[60px]" />
              )}
            </div>
            <div
              className="mr-[30px] w-[120px] md:h-[40px] h-[32px] px-[12px] rounded-[5px] hover:bg-transparent hover:border-[1px] hover:border-[#14161d] bg-[#14161d] flex justify-center items-center font-[600] md:text-[18px] text-[14px] text-[#a1a2a5] leading-[21px] cursor-pointer"
              onClick={() => {
                resetMilestone();
                setStage(0);
                setCheckedAll(false);
                //reset escrow info
                setDescription("");
                setReceiver("");
                setAmount(0);
              }}
            >
              CANCEL
            </div>
          </div>
        </div>
      )}
      {stage === 2 && (
        <div className="text-[#FFFFFF]">
          <div className="md:text-[44px] text-[30px] pt-[185px] font-[700] text-center">
            View, Dispute, Complete your{" "}
            <span className="text-[#017CE9]">Escrow</span>
          </div>
          <div className="order-1 md:order-2">
            <div className="mt-[10px] py-[20px] grid md:grid-cols-3 gap-12">
              <div>
                <div className="mt-[14px] text-[14px] md:text-[18px] leading-[21px] font-[300] text-[#CFCFCF]">
                  Escrow # {escrowData[currentEscrow].randomSeed}
                </div>

                <div className="font-[600] lg:text-[40px] sm:text-[30px] text-[24px]">
                  {escrowRestData.description}
                </div>
              </div>

              <div>
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Receiver
                  </div>
                  <div className="flex items-center">
                    <span className="ml-[5px] truncate max-w-[100%] block font-[600] text-[18px] md:text-[20px]">
                      {shortenAddress(escrowRestData.receiver)}
                    </span>
                    <i
                      className="ml-[10px] fas fa fa-solid fa-clone"
                      onClick={() => {
                        navigator.clipboard.writeText(escrowRestData.receiver);
                        toast("Address Copied");
                      }}
                    />
                  </div>
                </div>
                <div className="mt-[30px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Milestones
                  </div>
                  <div className="font-[600] text-[18px] md:text-[20px] flex items-center">
                    {escrowRestData.milestones.filter((milestone: any) => {
                      return milestone.amount > 0;
                    }).length - currentIdx}
                    <span className="mx-[5px]">/</span>
                    {
                      escrowRestData.milestones.filter((milestone: any) => {
                        return milestone.amount > 0;
                      }).length
                    }
                  </div>
                </div>
              </div>

              <div>
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Amount
                  </div>
                  <div className="font-[600] text-[18px] md:text-[20px] flex items-center">
                    {numberWithCommas(Number(escrowRestData.amount))}
                    <div className="ml-[10px] md:w-[18px] md:h-[18px] w-[14px] h-[14px] bg-usdc bg-cover"></div>
                  </div>
                </div>

                {/* {escrowData[currentEscrow].disputeStatus && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  Moderator:{" "}
                  <span className="text-sm font-[400]">
                    {escrowData[currentEscrow].disputeStatus && adminData
                      ? shortenAddress(adminData?.resolver.toBase58())
                      : "None"}
                  </span>
                </div>
              )} */}

                <div className="mt-[30px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Disputed
                  </div>
                  {escrowData[currentEscrow].disputeStatus ? (
                    <span className="text-[#ad2c44] font-[600] text-[18px] md:text-[20px]">
                      Yes
                    </span>
                  ) : (
                    <span className="font-[600] text-[18px] md:text-[20px]">
                      No
                    </span>
                  )}
                </div>
              </div>
            </div>
            {escrowRestData.created_at && (
              <div className="mt-[14px] text-[16px] leading-[21px] font-[300] flex flex-row-reverse text-[#747474]">
                {escrowRestData.date}
              </div>
            )}
          </div>
          <div className="mt-[30px] border-b-[2px] border-[#65686e] opacity-20 h-0"></div>
          <div className="mt-[40px] md:text-[30px] text-[20px] font-[700]">
            Milestones
          </div>
          <div className="grid md:grid-cols-3 gap-16 mt-[50px] grid-cols-1">
            {escrowRestData.milestones &&
              escrowRestData.milestones.map(
                (item: any, index: number) =>
                  item.amount > 0 && (
                    <div
                      key={`milestone-${index}`}
                      className="flex items-center mt-[10px]"
                    >
                      {/* <div className="flex justify-center items-center rounded-[40px] w-[40px] h-[40px] bg-milestone-index1-bgcolor text-[20px] font-[600]">
                        {index + 1}
                      </div> */}

                      <div
                        className={
                          index === selectedMilestone
                            ? "rounded-[10px] bg-dashboard-card2-interior1-bgcolor p-[3px] cursor-pointer grow"
                            : "rounded-[10px] bg-dashboard-card2-interior2-bgcolor cursor-pointer grow"
                        }
                        onClick={() => {
                          setSelectedMilestone(index);
                        }}
                      >
                        <div className="h-[10px] bg-dashboard-card2-interior1-bgcolor rounded-t-[10px]"></div>
                        <div className="bg-[#08080e] rounded-[7px]">
                          <div className="py-[28px] px-[35px] bg-dashboard-card2-interior2-bgcolor">
                            <div className="flex items-center">
                              {escrowData[currentEscrow].initializerAmount[
                                index
                              ] === 0 ? (
                                <div className="w-[30px] h-[30px] border-[5px] border-[#0e1622] rounded-[50px] flex justify-center items-center">
                                  <div className="bg-check bg-cover w-[9.6px] h-[7.2px]" />
                                </div>
                              ) : (
                                <div className="w-[30px] h-[30px] border-[5px] border-[#0e1622] rounded-[50px] flex justify-center items-center">
                                  <div className="text-[#017CE9] text-[16px] font-[700]">
                                    {index + 1}
                                  </div>
                                </div>
                              )}{" "}
                              <div className="ml-[13px] text-[20px] leading-[23px] font-[400] grow break-all">
                                {item?.mileston}
                              </div>
                            </div>
                            <div className="mt-[15px] break-all text-[#ADADAD]">
                              {escrowRestData.milestone1}
                            </div>
                            <div className="mt-[32px]">
                              <div className="flex justify-between items-center">
                                <div className="text-[#CFCFCF] md:text-[14px]">
                                  Amount
                                </div>
                                <div className="text-[#ffffff] ml-[10px] md:text-[18px] font-[600] flex items-center">
                                  {numberWithCommas(item.amount)}
                                  <div className="ml-[10px] md:w-[18px] md:h-[18px] w-[14px] h-[14px] bg-usdc bg-cover"></div>
                                </div>
                              </div>
                              <div className="mt-[27px] flex justify-between items-center">
                                <div className="text-[#CFCFCF]">Status </div>
                                <div className="text-[#ffffff] ml-[10px] font-[600] flex items-center">
                                  {escrowData[currentEscrow].initializerAmount[
                                    index
                                  ] === 0 ? (
                                    <span className="text-[#ffffff]">
                                      Completed
                                    </span>
                                  ) : escrowData[currentEscrow]
                                      .disputeStatus ? (
                                    <span className="text-[#ffffff]">
                                      Disputed
                                    </span>
                                  ) : (
                                    "In Progress"
                                  )}
                                  {escrowData[currentEscrow].disputeStatus ? (
                                    <div className="ml-[10px] bg-dispute bg-cover w-[18px] h-[18px]"></div>
                                  ) : (
                                    <div className="ml-[10px] bg-progress bg-cover w-[18px] h-[18px]"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
          </div>
          <div className="mt-[40px] flex flex-row-reverse items-center">
            {escrowData[currentEscrow].active &&
              !escrowData[currentEscrow].disputeStatus && (
                <div
                  className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#017CE9] hover:border-[1px] hover:border-[#053665] hover:bg-transparent flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                  onClick={() => approvePayment()}
                >
                  {!isLoading1 ? (
                    "Complete"
                  ) : (
                    <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                  )}
                </div>
              )}
            {escrowData[currentEscrow].active &&
              !escrowData[currentEscrow].disputeStatus && (
                <div
                  className="md:mr-[23px] mr-[10px] md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] text-[#C20000] hover:text-[#FFFFFF] bg-[#1f0d14] border-[1px] border-[#C20000] hover:bg-[#C20000] flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                  onClick={() => {
                    dispute();
                  }}
                >
                  {!isLoading2 ? (
                    "Dispute"
                  ) : (
                    <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                  )}
                </div>
              )}
            <div
              className="md:mr-[23px] mr-[10px] md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] text-[#a1a2a5] hover:border-[1px] hover:border-[#14161d] bg-[#14161d] hover:bg-transparent flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
              onClick={() => {
                setStage(0);
                setSelectedMilestone(0);
              }}
            >
              Back
            </div>
          </div>
        </div>
      )}
      {stage === 3 && (
        <div className="text-[#FFFFFF]">
          <div className="md:text-[44px] text-[30px] pt-[185px] font-[700] text-center">
            View, Dispute, Refund your{" "}
            <span className="text-[#017CE9]">Escrow</span>
          </div>
          <div className="order-1 md:order-2">
            <div className="mt-[10px] py-[20px] grid md:grid-cols-3 gap-12">
              <div>
                <div className="mt-[14px] text-[14px] md:text-[18px] leading-[21px] font-[300] text-[#CFCFCF]">
                  Escrow # {escrowData[currentEscrow].randomSeed}
                </div>

                <div className="font-[600] lg:text-[40px] sm:text-[30px] text-[24px]">
                  {escrowRestData.description}
                </div>
              </div>

              <div>
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Creator
                  </div>
                  <span className="ml-[5px] truncate max-w-[100%] block font-[600] text-[18px] md:text-[20px]">
                    {shortenAddress(
                      escrowData[currentEscrow].initializerKey.toString()
                    )}
                  </span>
                </div>
                <div className="mt-[30px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Milestones
                  </div>
                  <div className="font-[600] text-[18px] md:text-[20px] flex items-center">
                    {escrowRestData.milestones.filter((milestone: any) => {
                      return milestone.amount > 0;
                    }).length - currentIdx}
                    <span className="mx-[5px]">/</span>
                    {
                      escrowRestData.milestones.filter((milestone: any) => {
                        return milestone.amount > 0;
                      }).length
                    }
                  </div>
                </div>
              </div>

              <div>
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Amount
                  </div>
                  <div className="font-[600] text-[18px] md:text-[20px] flex items-center">
                    {numberWithCommas(Number(escrowRestData.amount))}
                    <div className="ml-[10px] md:w-[18px] md:h-[18px] w-[14px] h-[14px] bg-usdc bg-cover"></div>
                  </div>
                </div>

                {/* {escrowData[currentEscrow].disputeStatus && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  Moderator
                  <span className="text-sm font-[400]">
                    {escrowData[currentEscrow].disputeStatus && adminData
                      ? shortenAddress(adminData?.resolver.toBase58())
                      : "None"}
                  </span>
                </div>
              )} */}

                <div className="mt-[30px] text-[14px] leading-[21px] font-[300] flex justify-between rounded-[10px] bg-dashboard-card2-interior2-bgcolor h-[60px] px-[20px] items-center">
                  <div className=" text-[#747474] md:text-[20px] font-[600]">
                    Disputed
                  </div>
                  {escrowData[currentEscrow].disputeStatus ? (
                    <span className="text-[#ad2c44] font-[600] text-[18px] md:text-[20px]">
                      Yes
                    </span>
                  ) : (
                    <span className="font-[600] text-[18px]">No</span>
                  )}
                </div>
              </div>
            </div>
            {escrowRestData.created_at && (
              <div className="mt-[14px] text-[16px] leading-[21px] font-[300] flex flex-row-revers text-[#747474]">
                <span>{escrowRestData.date}</span>
              </div>
            )}
          </div>
          <div className="mt-[30px] border-b-[2px] border-[#65686e] opacity-20 h-0"></div>
          <div className="mt-[40px] md:text-[30px] text-[20px] font-[700]">
            Milestones
          </div>
          <div className="grid md:grid-cols-3 gap-16 mt-[50px] grid-cols-1">
            {escrowRestData.milestones &&
              escrowRestData.milestones.map(
                (item: any, index: number) =>
                  item.amount > 0 && (
                    <div
                      key={`milestone-${index}`}
                      className="flex items-center mt-[10px]"
                    >
                      {/* <div className="flex justify-center items-center rounded-[40px] w-[40px] h-[40px] bg-milestone-index1-bgcolor text-[20px] font-[600]">
                        {index + 1}
                      </div> */}

                      <div
                        className="rounded-[10px] bg-dashboard-card2-interior2-bgcolor cursor-pointer grow"
                        // onClick={() => {
                        //   setSelectedMilestone(index);
                        // }}
                      >
                        <div className="h-[10px] bg-dashboard-card2-interior1-bgcolor rounded-t-[10px]"></div>
                        <div className="py-[28px] px-[35px]">
                          <div className="flex items-center">
                            {escrowData[currentEscrow].initializerAmount[
                              index
                            ] === 0 ? (
                              <div className="w-[30px] h-[30px] border-[5px] border-[#0e1622] rounded-[50px] flex justify-center items-center">
                                <div className="bg-check bg-cover w-[9.6px] h-[7.2px]" />
                              </div>
                            ) : (
                              <div className="w-[30px] h-[30px] border-[5px] border-[#0e1622] rounded-[50px] flex justify-center items-center">
                                <div className="text-[#017CE9] text-[16px] font-[700]">
                                  {index + 1}
                                </div>
                              </div>
                            )}{" "}
                            <div className="ml-[13px] text-[20px] leading-[23px] font-[400] grow break-all">
                              {item?.mileston}
                            </div>
                          </div>
                          <div className="mt-[15px] break-all text-[#ADADAD]">
                            {escrowRestData.milestone1}
                          </div>
                          <div className="mt-[32px]">
                            <div className="flex justify-between items-center">
                              <div className="text-[#CFCFCF] md:text-[14px]">
                                Amount
                              </div>
                              <div className="text-[#ffffff] ml-[10px] md:text-[18px] font-[600] flex items-center">
                                {numberWithCommas(item.amount)}{" "}
                                <div className="ml-[10px] md:w-[18px] md:h-[18px] w-[14px] h-[14px] bg-usdc bg-cover"></div>
                              </div>
                            </div>
                            <div className="mt-[27px] flex justify-between items-center">
                              <div className="text-[#CFCFCF]">Status </div>
                              <div className="text-[#ffffff] font-[600] ml-[10px] flex items-center">
                                {escrowData[currentEscrow].initializerAmount[
                                  index
                                ] === 0 ? (
                                  <span className="text-[#ffffff]">
                                    Completed
                                  </span>
                                ) : escrowData[currentEscrow].disputeStatus ? (
                                  <span className="text-[#ffffff]">
                                    Disputed
                                  </span>
                                ) : (
                                  "In Progress"
                                )}
                                {escrowData[currentEscrow].disputeStatus ? (
                                  <div className="ml-[10px] bg-dispute bg-cover w-[18px] h-[18px]"></div>
                                ) : (
                                  <div className="ml-[10px] bg-progress bg-cover w-[18px] h-[18px]"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
          </div>
          <div className="mt-[40px] flex flex-row-reverse items-center">
            {escrowData[currentEscrow].active &&
              !escrowData[currentEscrow].disputeStatus && (
                <div
                  className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#017CE9] hover:border-[1px] hover:border-[#053665] hover:bg-transparent flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                  onClick={() => refundPayment()}
                >
                  {!isLoading1 ? (
                    "Refund"
                  ) : (
                    <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                  )}
                </div>
              )}
            {escrowData[currentEscrow].active &&
              !escrowData[currentEscrow].disputeStatus && (
                <div
                  className="md:mr-[23px] mr-[10px] md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#1f0d14] border-[1px] border-[#C20000] hover:bg-[#C20000] text-[#C20000] hover:text-[#FFFFFF] flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                  onClick={() => {
                    dispute();
                  }}
                >
                  {!isLoading2 ? (
                    "Dispute"
                  ) : (
                    <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                  )}
                </div>
              )}
            <div
              className="md:mr-[23px] mr-[10px] md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] text-[#a1a2a5] hover:border-[1px] hover:border-[#14161d] bg-[#14161d] hover:bg-transparent flex justify-center items-center md:font-[600] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
              onClick={() => {
                setStage(0);
                setSelectedMilestone(0);
              }}
            >
              Back
            </div>
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};
export default Home;
